# Signature based workflow tutorial app

Includes smart contract and frontend interface

## Objective

* There's a structure `Num{uint256 value; address setter;}` in the smart contract named SigFlow, stored as the variable `num`.
* Any address (`setter`) can update `value`, which is stored in `num`.
* But `setter` _won't have to execute any transaction_, thus they don't need to spend on _gas_. This is the main goal of any signature based project.
* Only the owner of the contract (contract deployer) can call a function (`setNum`) to set the `value`, _on behalf of `setter`_.
* To achieve this, `setter` has to sign a message (`Order`) containing the new `value` intended to be set.
* The signature is verified when the contract owner calls the `setNum` function. After verification, the `value` and the `setter` fields of the `num` variable are updated as intended.

## How to run

* Install Metamask extension for browser https://metamask.io/download/

1. Clone this project.

**Blockchain part**

2. In the root directory, run `npm install` to install truffle for running blockchain locally.
3. Run `truffle developer` to initiate blockchain and to start an interactive console.
4. Deploy the SigFlow contract by typing `migrate` in the Truffle developer console.
5. For interacting with the deployed SigFlow contract, create a reference to it: `contract = await SigFlow.deployed()`.
6. Check `num` variable's value: `contract.num()`. Keep this console open for later use.

**Frontend part**

7. Start a new terminal and go to the `client` folder.
8. Run `npm install`, and then `npm start` to serve the frontend interface. Open the frontend link in a browser with Metamask extension installed (or any other injected wallet, but Metamask's UI is one of the best for this task).
9. In the browser, click on **Connect Wallet** button to connect an account of the wallet.
10. Enter a number in the input field `value`.
11. Click on `Sign message`. Wallet pops up with a signature request. It shows the message parameters to be signed. Click on Sign to generate signature.
12. Result is shown in a box which contains `value`, `setter`, `validPeriod` and the message signature. `validPeriod` is one day from current time.
13. Go to truffle developer console (the terminal used in Blockchain part) and call the `setNum` function by copy-pasting the result data obtained in the frontend:  
    ```
    contract.setNum({value: 2, validPeriod: 1683129773, setter: "0xb024f779c38b2f22e3ba507128d7f2144b6e65ed"}, "0xa9d3fe0bc987690e595dbbbe84352d0e5a257cc81114f13a446f9e6ab4c213f62c675f6d91fddb5a87a812abf3c6af5f1f34df83a7637dccba526f3968b2b85b1b")
    ```
    Transaction is executed which updates `num` and also emits some events.  
    _Note that the function caller in this case is accounts\[0\], which is the deployer of the contract, thus also the owner._
14. Check `num` again by calling `contract.num()`. `value` and `setter` should be updated now.
15. Try running `setNum()` with the same parameters. It would throw error because that data is already processed.
16. Run `setNum()` with different `value`s and different wallet accounts for signing the messages and see the resulting `num`.

**Canceling an order**

17. Import a Truffle account into Metamask wallet, and generate a signature in the frontend using that account.
18. With the same account, call `cancelOrder` function:  
    ```
    contract.cancelOrder({value: 64, setter: "0x580023c59204edeedfc8696957f0c8627736efcb", validPeriod: 1683136998}, "0xf5114f420316b151d38fc6d0a1e5f65712e114a48f4c8dad801872537aed7d6447b3c6015be5cf2bc221eb2ce5fda1ba3f6aff813af74a2db6d39455927cc2b31c", {from: accounts[1]})
    ```
19. The order is canceled. Try calling `setNum` with the owner account passing the same message parameters and message signature. It should throw an error saying `Order already executed`.  
    ```
    contract.setNum({value: 64, setter: "0x580023c59204edeedfc8696957f0c8627736efcb", validPeriod: 1683136998}, "0xf5114f420316b151d38fc6d0a1e5f65712e114a48f4c8dad801872537aed7d6447b3c6015be5cf2bc221eb2ce5fda1ba3f6aff813af74a2db6d39455927cc2b31c", {from: accounts[0]})
    ```
