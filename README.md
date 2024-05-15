Ton-token-jetton

### Usage

```bash
yarn install
---
yarn build # To build & compile the contract
yarn test # To run test cases for the contract
yarn deploy # To deploy contract
---
yarn read # To read contract data from the blockchain
yarn d1 # (Optional) To Transfer the Jetton Token to the new account
yarn d2 # (Optional) To generate the Transfer URL to let the new account to transfer the Jetton Token to the other account
```


-   [TEP-64] (https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md)
-   [TEP-74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)

-   在Jetton中，如果您想将您的Jetton令牌转让给某人，您需要向您的Jetton钱包发送消息，而不是向新收件人的钱包发送消息.
-   forward_ton_amount 越小越好  (1e-9 TON).

### 相关文档

-   https://blog.ton.org/how-to-shard-your-ton-smart-contract-and-why-studying-the-anatomy-of-tons-jettons
-   https://docs.ton.org/develop/dapps/asset-processing/jettons

## Deployment

部署注意：
contract.tact 保证合约入口
如果需要更改 在[tact.config.json] 中改


## Testing

测试模版都以 spec.ts结束