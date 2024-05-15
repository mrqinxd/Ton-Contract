import { Address, beginCell, contractAddress, toNano, TonClient4, internal, fromNano, WalletContractV4 } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader, printSeparator } from "./utils/print";
import { buildOnchainMetadata } from "./utils/jetton-helpers";
import { mnemonicToPrivateKey } from "ton-crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ========================================
import { SampleJetton, storeTokenTransfer } from "./output/SampleJetton_SampleJetton";
// ========================================

let NewOnwer_Address = Address.parse("0QD9cs02rsWK1KiJhXeQfpEh0EqVWqg3uOEaND0UtUp8aoEz"); // 🔴 Owner should usually be the deploying wallet's address.

(async () => {
    const client4 = new TonClient4({
        endpoint: "https://sandbox-v4.tonhubapi.com",
        // endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    let mnemonics = (process.env.mnemonics_2 || "").toString();
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0;
    let wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });
    let wallet_contract = client4.open(wallet);
    Address.isFriendly

    const jettonParams = {
        name: "QIN Test Name",
        description: "This is description of Test Jetton Token in Tact-lang",
        symbol: "QIN",
        image: "https://avatars.githubusercontent.com/u/104382459?s=200&v=4",
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano("10000"); // 🔴 Set the specific total supply in nano

    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well.
    let init = await SampleJetton.init(wallet_contract.address, content, max_supply);
    let jetton_masterWallet = contractAddress(workchain, init);
    let contract_dataFormat = SampleJetton.fromAddress(jetton_masterWallet);
    let contract = client4.open(contract_dataFormat);
    console.log("链上合约地址"+contract_dataFormat.address)

    //获取部署者 链上的 jt 地址
    let jetton_wallet = await contract.getGetWalletAddress(wallet_contract.address);
    //打印祝记词钱包地址 v4
    console.log("✨ " + wallet_contract.address + "'s JettonWallet ==> ");

    // 发送附带消息
    const test_message_left = beginCell()
        .storeBit(0) // 🔴  whether you want to store the forward payload in the same cell or not. 0 means no, 1 means yes.
        .storeUint(0, 32)
        .storeBuffer(Buffer.from("Hello, GM -- Left.", "utf-8"))
        .endCell();

    //不同的发送方式
    // const test_message_right = beginCell()
    //     .storeBit(1) // 🔴 whether you want to store the forward payload in the same cell or not. 0 means no, 1 means yes.
    //     .storeRef(beginCell().storeUint(0, 32).storeBuffer(Buffer.from("Hello, GM. -- Right", "utf-8")).endCell())
    //     .endCell();

    // ========================================forward_string 消息
    let forward_string_test = beginCell().storeBit(1).storeUint(0, 32).storeStringTail("EEEEEE").endCell();
    //整理一个sendTransfer的body
    let packed = beginCell()
        .store(
            storeTokenTransfer({
                $$type: "TokenTransfer",
                query_id: 0n,
                amount: toNano(200), //发送量 用tonano去转bigint
                sender: NewOnwer_Address,//要发送到的地址
                response_destination: wallet_contract.address, // 部署者地址｜助记词地址
                custom_payload: forward_string_test,
                forward_ton_amount: toNano("0.000000001"),
                forward_payload: test_message_left,
            })
        )
        .endCell();

    let deployAmount = toNano("0.3");
    let seqno: number = await wallet_contract.getSeqno();
    let balance: bigint = await wallet_contract.getBalance();
    // ========================================
    printSeparator();
    console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
    console.log("\n🛠️ Calling To JettonWallet:\n" + jetton_wallet + "\n");
    await wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: jetton_wallet,
                value: deployAmount,
                init: {
                    code: init.code,
                    data: init.data,
                },
                bounce: true,
                body: packed,
            }),
        ],
    });
})();
