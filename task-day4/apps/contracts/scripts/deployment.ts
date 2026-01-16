import { viem } from "hardhat";

import Artifact  from "../artifacts/contracts/simple-strorage.sol/SimpleStorage.json";

async function main() {
    const[WalletClient] = await viem.getWalletClients();

    const publicClient = await viem.getPublicClient();

    console.log("Deploying contracts:", WalletClient.account.address);

    const hash = await WalletClient.deployContract({
        abi: Artifact.abi,
        bytecode: Artifact.bytecode as `0x${string}`,
        args: [],
        gas: 3_000_000n,
    });

    console.log("Deployment at hash:", hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log("Contract deployed at address:", receipt.contractAddress);
}
    main().catch((error) => {
    console.error(error);
    process.exitCode = 1;

});