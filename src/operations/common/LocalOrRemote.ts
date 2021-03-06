import * as shell from "shelljs";

import { Parameter, Secret } from "../../decorators";
import { Secrets } from "../../Handlers";
import { allReposInTeam } from "./allReposInTeamRepoFinder";
import { RepoFinder } from "./repoFinder";

import { AllRepos, RepoFilter } from "./repoFilter";

/**
 * Convenient superclass that can handle operating on projects transparently locally or from GitHub.
 */
export abstract class LocalOrRemote {

    @Parameter({
        displayName: "local",
        displayable: false,
        description: "Should the editor run locally or query Atomist for repos?",
        pattern: /^(?:true|false)$/,
        validInput: "Boolean",
        required: false,
        type: "boolean",
    })
    public local: boolean = false;

    @Parameter({
        displayName: "directory to look for projects in if working locally",
        displayable: false,
        description: "Directory to look for repos in. Must follow <org>/<repo> convention",
        pattern: /^.*$/,
        validInput: "Valid path for your OS",
        required: false,
    })
    public dir: string;

    /**
     * To use this in an event handler rather than a command handler,
     * please override this to be decorated with @Secret(Secrets.OrgToken)
     */
    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken: string;

    /**
     * Operate on all repos matching this filter.
     * @param {(r: RepoId) => boolean} repoFilter
     */
    constructor(public repoFilter: RepoFilter = AllRepos) {
    }

    protected repoFinder(): RepoFinder {
        return this.local ? allReposInTeam(this.cwd()) : allReposInTeam();
    }

    /**
     * Return the current working directory to use for finding local repos
     * @return {string}
     */
    protected cwd(): string {
        return this.dir || shell.pwd();
    }

}
