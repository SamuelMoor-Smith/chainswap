// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0 <0.9.0;

import "@routerprotocol/evm-gateway-contracts/contracts/IDapp.sol";
import "@routerprotocol/evm-gateway-contracts/contracts/IGateway.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @title XERC1155
/// @author Yashika Goyal
/// @notice A cross-chain ERC-1155 smart contract to demonstrate how one can create
/// cross-chain NFT contracts using Router CrossTalk.
contract XERC1155WithURIs is ERC1155, IDapp {
  // address of the owner
  address public owner;

  // address of the gateway contract
  IGateway public gatewayContract;

  // chain type + chain id => address of our contract in string format
  mapping(string => string) public ourContractOnChains;

  // mapping of token ID => URI
  mapping (uint256 => string) private _tokenURIs;

  // counter for the token ID
  uint256 public tokenIdTracker = 0;

  // transfer params struct where we specify which NFTs should be transferred to
  // the destination chain and to which address
  struct TransferParams {
    uint256 transferTokenId;
    string tokenURI;
    bytes nftData;
    bytes recipient;
  }

  constructor(
    string memory _uri,
    address payable gatewayAddress,
    string memory feePayerAddress
  ) ERC1155(_uri) {
    gatewayContract = IGateway(gatewayAddress);
    owner = msg.sender;
    gatewayContract.setDappMetadata(feePayerAddress);
  }

  /// @notice function to set the fee payer address on Router Chain.
  /// @param feePayerAddress address of the fee payer on Router Chain.
  function setDappMetadata(string memory feePayerAddress) external {
    require(msg.sender == owner, "only owner");
    gatewayContract.setDappMetadata(feePayerAddress);
  }

  /// @notice function to set the Router Gateway Contract.
  /// @param gateway address of the gateway contract.
  function setGateway(address gateway) external {
    require(msg.sender == owner, "only owner");
    gatewayContract = IGateway(gateway);
  }

  function mint(
    address account,
    bytes memory nftData,
    string memory uri
  ) external {
    _mint(account, tokenIdTracker, 1, nftData); // Only mint 1 token
    _setURI(tokenIdTracker, uri); // Set the uri for that token
    tokenIdTracker++;
  }

  // Function to set the URI for a tokenId
  function _setURI(uint256 tokenId, string memory _uri) internal virtual {
      _tokenURIs[tokenId] = _uri;
  }

  // Function to get the uri for a tokenId
    function getURI(uint256 tokenId) public view virtual returns (string memory) {
    string memory _tokenURI = _tokenURIs[tokenId];
    require(bytes(_tokenURI).length > 0, "ERC1155Metadata: No URI set for this token (could not be minted)");
    return _tokenURI;
    }


  /// @notice function to set the address of our NFT contracts on different chains.
  /// This will help in access control when a cross-chain request is received.
  /// @param chainId chain Id of the destination chain in string.
  /// @param contractAddress address of the NFT contract on the destination chain.
  function setContractOnChain(
    string calldata chainId,
    string calldata contractAddress
  ) external {
    require(msg.sender == owner, "only owner");
    ourContractOnChains[chainId] = contractAddress;
  }

  /// @notice function to generate a cross-chain NFT transfer request.
  /// @param destChainId chain ID of the destination chain in string.
  /// @param tokenId tokenId to transfer.
  /// @param requestMetadata abi-encoded metadata according to source and destination chains
  function transferCrossChain(
    string calldata destChainId,
    uint256 tokenId,
    bytes calldata requestMetadata
  ) public payable {
    require(
      keccak256(abi.encodePacked(ourContractOnChains[destChainId])) !=
        keccak256(abi.encodePacked("")),
      "contract on dest not set"
    );

    TransferParams memory transferParams;
    transferParams.transferTokenId=tokenId;
    transferParams.tokenURI=getURI(tokenId);
    transferParams.nftData=bytes('0x');
    transferParams.recipient=toBytes(msg.sender);

    // burning the NFTs from the address of the user calling _burnBatch function
    _burn(msg.sender, tokenId, 1);
    delete _tokenURIs[tokenId];  // Remove the URI

    // sending the transfer params struct to the destination chain as payload.
    bytes memory packet = abi.encode(transferParams);
    bytes memory requestPacket = abi.encode(
      ourContractOnChains[destChainId],
      packet
    );

    gatewayContract.iSend{ value: msg.value }(
      1,
      0,
      string(""),
      destChainId,
      requestMetadata,
      requestPacket
    );
  }

  /// @notice function to get the request metadata to be used while initiating cross-chain request
  /// @return requestMetadata abi-encoded metadata according to source and destination chains
  function getRequestMetadata(
    uint64 destGasLimit,
    uint64 destGasPrice,
    uint64 ackGasLimit,
    uint64 ackGasPrice,
    uint128 relayerFees,
    uint8 ackType,
    bool isReadCall,
    string memory asmAddress
  ) public pure returns (bytes memory) {
    bytes memory requestMetadata = abi.encodePacked(
      destGasLimit,
      destGasPrice,
      ackGasLimit,
      ackGasPrice,
      relayerFees,
      ackType,
      isReadCall,
      asmAddress
    );
    return requestMetadata;
  }

  /// @notice function to handle the cross-chain request received from some other chain.
  /// @param packet the payload sent by the source chain contract when the request was created.
  /// @param srcChainId chain ID of the source chain in string.
  function iReceive(
    string calldata requestSender,
    bytes calldata packet,
    string calldata srcChainId
  ) external override returns (bytes memory) {
    require(msg.sender == address(gatewayContract), "only gateway");
    require(
      keccak256(bytes(ourContractOnChains[srcChainId])) ==
        keccak256(bytes(requestSender)),
      "only our contract"
    );

    // decoding our payload
    TransferParams memory transferParams = abi.decode(packet, (TransferParams));
    _mint(toAddress(transferParams.recipient), tokenIdTracker, 1, transferParams.nftData);
    _setURI(tokenIdTracker, transferParams.tokenURI);
    tokenIdTracker++;
    // _mintBatch(
    //   toAddress(transferParams.recipient),
    //   transferParams.nftIds,
    //   transferParams.nftAmounts,
    //   transferParams.nftData
    // );

    return abi.encode(srcChainId);
  }

  /// @notice function to handle the acknowledgement received from the destination chain
  /// back on the source chain.
  /// @param requestIdentifier event nonce which is received when we create a cross-chain request
  /// We can use it to keep a mapping of which nonces have been executed and which did not.
  /// @param execFlag a boolean value suggesting whether the call was successfully
  /// executed on the destination chain.
  /// @param execData returning the data returned from the handleRequestFromSource
  /// function of the destination chain.
  function iAck(
    uint256 requestIdentifier,
    bool execFlag,
    bytes memory execData
  ) external override {}

  /// @notice Function to convert bytes to address
  /// @param _bytes bytes to be converted
  /// @return addr address pertaining to the bytes
  function toAddress(bytes memory _bytes) internal pure returns (address addr) {
    bytes20 srcTokenAddress;
    assembly {
      srcTokenAddress := mload(add(_bytes, 0x20))
    }
    addr = address(srcTokenAddress);
  }

  function toBytes(address a) public pure returns (bytes memory b){
    assembly {
        let m := mload(0x40)
        a := and(a, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
        mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
        mstore(0x40, add(m, 52))
        b := m
   }
}
}
