// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ECDSA.sol";

contract SigFlow {
    using ECDSA for bytes32;

    address owner;
    bytes32 _DOMAIN_SEPARATOR_HASH;
    bytes32 _ORDER_HASH;

    struct Num {
        uint256 value;
        address setter;
    }
    Num public num;

    struct Order {
        uint256 value;
        address setter;
        uint256 validPeriod;
    }

    mapping (bytes32 => bool) executedOrders;

    event NumUpdated(
        uint256 value,
        address indexed setter
    );
    event OrderProcessed(
        uint256 value,
        address indexed setter,
        uint256 validPeriod
    );
    event OrderCanceled(
        uint256 value,
        address indexed setter,
        uint256 validPeriod
    );

    constructor(string memory _name, string memory _version) {
        owner = msg.sender;
        _DOMAIN_SEPARATOR_HASH = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(_name)),
            keccak256(bytes(_version)),
            block.chainid,
            address(this)
        ));
        _ORDER_HASH = keccak256("Order(uint256 value,address setter,uint256 validPeriod)");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Access denied: only owner can call");
        _;
    }

    function _validateOrder(Order calldata _order, bytes calldata _signature) internal {
        // Validate signature
        bytes32 orderHash = _DOMAIN_SEPARATOR_HASH.toTypedDataHash(keccak256(abi.encode(
            _ORDER_HASH,
            _order.value,
            _order.setter,
            _order.validPeriod
        )));
        address signer = orderHash.recover(_signature);
        require(signer == _order.setter, "Invalid signature");

        // Order should not be already executed
        require(executedOrders[orderHash] == false, "Order already executed");
        executedOrders[orderHash] = true;
    }

    function setNum(Order calldata _order, bytes calldata _signature) public onlyOwner {
        _validateOrder(_order, _signature);
        require(block.timestamp <= _order.validPeriod, "Order expired");
        num.value = _order.value;
        num.setter = _order.setter;
        emit NumUpdated(_order.value, _order.setter);
        emit OrderProcessed(_order.value, _order.setter, _order.validPeriod);
    }

    function cancelOrder(Order calldata _order, bytes calldata _signature) public {
        require(_order.setter == msg.sender, "Only order creator can cancel their order");
        _validateOrder(_order, _signature);
        emit OrderCanceled(_order.value, _order.setter, _order.validPeriod);
    }
}
