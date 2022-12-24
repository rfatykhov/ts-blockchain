import { createHash } from "https://deno.land/std@0.115.1/hash/mod.ts";

//type definitions

type Block = {
	data: string;
	hash: string;
	prev: string;
	token: string;
};

type Agent = {
	addAgent(agent: Agent): void;
	receiveBlock(block: Block): void;
	addData(data: Block["data"]): void;
};

//md5 hash

const hashOf = (str: string) => createHash("md5").update(str).toString();

const magicPrefix = Array(5).fill("0").join("");

//hash factory

const createAgent = (): Agent => {
	const chain: Block[] = [
		{
			data: "",
			prev: "",
			token: "",
			hash: hashOf(""),
		},
	];

	const agents: Agent[] = [];

	return {
		addAgent(agent) {
			agents.push(agent);
		},

		addData(data) {
			while (true) {
				const prev = chain[chain.length - 1].hash;
				const token = hashOf(Math.random().toString());
				const hash = hashOf(data + prev + token);

				if (hash.startsWith(magicPrefix)) {
					const block: Block = { data, prev, token, hash };
					chain.push(block);
					for (const agent of agents) {
						agent.receiveBlock(block);
					}
					return;
				}
			}
		},

		receiveBlock(block) {
			if (block.prev != chain[chain.length - 1].hash) {
				throw new Error(
					"Hash does not point to the previous hash in the chain"
				);
			}
			if (!block.hash.startsWith(magicPrefix)) {
				throw new Error("Hash does not start with the magic prefix");
			}
			const actualHash = hashOf(block.data + block.prev + block.token);
			if (actualHash !== block.hash) {
				throw new Error("Hash is not the hash of data|prev|token");
			}
			chain.push(block);
		},
	};
};
