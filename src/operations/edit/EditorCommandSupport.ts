import { HandleCommand } from "../../HandleCommand";
import { HandlerContext } from "../../HandlerContext";
import { HandlerResult } from "../../HandlerResult";
import { logger } from "../../internal/util/logger";
import { LocalOrRemoteRepoOperation } from "../common/LocalOrRemoteRepoOperation";
import { editUsingPullRequest, PullRequestEdit } from "../support/editorUtils";
import { ProjectEditor } from "./projectEditor";
import { isPromise } from "../../internal/util/async";

/**
 * Support for commands that edit all repos in context,
 * which may come either locally or from GitHub.
 */
export abstract class EditorCommandSupport extends LocalOrRemoteRepoOperation implements HandleCommand {

    public handle(context: HandlerContext): Promise<HandlerResult> {
        const load = this.repoLoader();
        const rawPe = this.projectEditor(context);
        const projectEditorPromise: Promise<ProjectEditor<any>> = isPromise(rawPe) ? rawPe : Promise.resolve(rawPe);

        return projectEditorPromise.then(projectEditor => {
            return this.repoFinder()(context)
                .then(repoIds => {
                    const reposToEdit = repoIds.filter(this.repoFilter);
                    logger.info("Repos to edit are " + reposToEdit.map(r => r.repo).join(","));
                    const editOps: Array<Promise<any>> =
                        reposToEdit.map(r => {
                            if (this.local) {
                                return load(r)
                                    .then(p => projectEditor(r, p, context));
                            } else {
                                return editUsingPullRequest(this.githubToken, context, r, projectEditor,
                                    // TODO customize PR config
                                    new PullRequestEdit("add-license", "Added license"));
                            }
                        });
                    return Promise.all(editOps)
                        .then(_ => {
                            return {
                                code: 0,
                                reposEdited: reposToEdit.length,
                                reposSeen: repoIds.length,
                            };
                        });
                });
        });
    }

    /**
     * Invoked after parameters have been populated in the context of
     * a particular operation. Return an actual editor or a promise,
     * if the editor needs to be created based on the current context.
     */
    public abstract projectEditor(context: HandlerContext): ProjectEditor<any> | Promise<ProjectEditor<any>>;

}
