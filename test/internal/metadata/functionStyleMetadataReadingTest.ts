import "mocha";
import { metadataFromInstance } from "../../../src/internal/metadata/metadataReading";

import * as assert from "power-assert";
import { CommandHandlerMetadata } from "../../../src/metadata/automationMetadata";
import { addAtomistSpringAgent } from "./addAtomistSpringAgent";

describe("function style metadata reading", () => {

    it("should get correct handler name", () => {
        assert(metadataFromInstance(addAtomistSpringAgent).name === "AddAtomistSpringAgent");
    });

    it("should extract metadataFromInstance from function sourced command handler", () => {
        const md = metadataFromInstance(addAtomistSpringAgent) as CommandHandlerMetadata;
        assert(md.parameters.length === 1);
        assert(md.parameters[0].name === "slackTeam");
        assert(md.mapped_parameters.length === 1);
        assert(md.mapped_parameters[0].local_key === "githubWebUrl");
        assert(md.mapped_parameters[0].foreign_key === "atomist://github_url");
        assert(md.secrets.length === 1);
        assert(md.secrets[0].name === "someSecret");
        assert(md.secrets[0].path === "atomist://some_secret");
    });
});
