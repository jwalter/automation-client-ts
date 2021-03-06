import { MappedParameter, Parameter, Parameters, Secret } from "../../../src/decorators";
import { HandleCommand } from "../../../src/HandleCommand";
import { commandHandlerFrom } from "../../../src/onCommand";
import { succeed } from "../../../src/operations/support/contextUtils";

@Parameters()
export class AddAtomistSpringAgentParams {

    @Parameter({
        displayName: "Slack Team ID",
        description: "team identifier for Slack team associated with this repo",
        pattern: /^T[0-9A-Z]+$/,
        validInput: "Slack team identifier of form T0123WXYZ",
        required: true,
    })
    public slackTeam: string;

    @MappedParameter("atomist://github_url")
    public githubWebUrl: string;

    @Secret("atomist://some_secret")
    public someSecret: string;
}

// Note we need an explicit type annotation here to avoid an error
// due to exporting an un-imported type
// Alternatively, if it's not exported it's fine
export const addAtomistSpringAgent: HandleCommand =
    commandHandlerFrom((ctx, params) =>
            ctx.messageClient.respond("I got your message: slackTeam=" + params.slackTeam)
                .then(succeed),
        AddAtomistSpringAgentParams,
        "AddAtomistSpringAgent");
