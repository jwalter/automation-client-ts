import { HandlerContext } from "../../HandlerContext";
import { GitProject } from "../../project/git/GitProject";
import { Project } from "../../project/Project";
import {
    BranchCommit,
    EditMode,
    isBranchCommit,
    isCustomExecutionEditMode,
    isPullRequest,
    PullRequest,
} from "../edit/editModes";
import { EditResult, ProjectEditor, successfulEdit } from "../edit/projectEditor";

/**
 * Edit a GitHub project using a PR or branch
 * @param context handler context for this operation
 * @param repo repo id
 * @param editor editor to use
 * @param ei how to persist the edit
 * @param parameters to editor
 */
export function editRepo<P>(context: HandlerContext,
                            repo: Project,
                            editor: ProjectEditor<P>,
                            ei: EditMode,
                            parameters?: P): Promise<EditResult> {
    if (isPullRequest(ei)) {
        return editProjectUsingPullRequest(context, repo as GitProject, editor, ei, parameters);
    } else if (isBranchCommit(ei)) {
        return editProjectUsingBranch(context, repo as GitProject, editor, ei, parameters);
    } else if (isCustomExecutionEditMode(ei)) {
        return ei.edit(repo);
    } else {
        // No edit to do
        return Promise.resolve(successfulEdit(repo, true));
    }
}

export function editProjectUsingPullRequest<P>(context: HandlerContext,
                                               gp: GitProject,
                                               editor: ProjectEditor<P>,
                                               pr: PullRequest,
                                               parameters?: P): Promise<EditResult> {

    return editor(gp, context, parameters)
        .then(r => r.edited ?
            raisePr(gp, pr) :
            {
                target: gp,
                success: false,
                edited: false,
            });
}

export function editProjectUsingBranch<P>(context: HandlerContext,
                                          gp: GitProject,
                                          editor: ProjectEditor<P>,
                                          ci: BranchCommit,
                                          parameters?: P): Promise<EditResult> {

    return editor(gp, context, parameters)
        .then(r => r.edited ?
            createAndPushBranch(gp, ci) :
            {
                target: gp,
                success: false,
                edited: false,
            });
}

/**
 * Create a branch, commit with current content and push
 * @param {GitProject} gp
 * @param {BranchCommit} ci
 */
export function createAndPushBranch(gp: GitProject, ci: BranchCommit): Promise<EditResult> {
    return gp.createBranch(ci.branch)
        .then(x => gp.commit(ci.message))
        .then(x => gp.push())
        .then(r => successfulEdit(r.target, true));
}

/**
 * Raise a PR from the current state of the project
 * @param {GitProject} gp
 * @param {PullRequest} pr
 */
export function raisePr(gp: GitProject, pr: PullRequest): Promise<EditResult> {
    return createAndPushBranch(gp, pr)
        .then(x => {
            return gp.raisePullRequest(pr.title, pr.body)
                .then(r => successfulEdit(gp));
        });
}
