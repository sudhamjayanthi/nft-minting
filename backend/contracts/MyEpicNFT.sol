// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

import {Base64} from "base64-sol/base64.sol";

contract MyEpicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    event NewEpicNFTMinted(address sender, uint256 tokenId);

    Counters.Counter private _tokenIds;

    string baseSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><style>@import url(https://fonts.googleapis.com/css?family=Inter);.t{fill:#000;font-family:Inter}</style><rect fill="#fff" height="100%" width="100%"/><path fill="#FADB5F" d="M39.275 81.434c13.924-45.544 33.747-56.084 79.29-42.16s56.085 33.748 42.16 79.292-33.747 56.084-79.29 42.16-56.085-33.748-42.16-79.292"/><text style="font-size:11px" dominant-baseline="middle" text-anchor="middle" class="t" y="50%" x="50%">Omelette #';
    string middleSvg =
        '</text><text style="font-size:9px;font-weight:700" dominant-baseline="middle" text-anchor="middle" class="t" y="95%" x="50%">owned by ';

    constructor() ERC721("Omletteee Paradiseee", "SQUARE") {
        console.log("WAGMI");
    }

    function makeAnEpicNFT(string memory _name) public {
        uint256 newItemId = _tokenIds.current();

        require(newItemId < 50, "Sorry we're sold out ;)");

        _safeMint(msg.sender, newItemId);

        string memory finalSvg = string(
            abi.encodePacked(
                baseSvg,
                Strings.toString(newItemId),
                middleSvg,
                _name,
                "</text></svg>"
            )
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name" : "Omelette #',
                Strings.toString(newItemId),
                '", "description" : "Dope omelette nfts like never beforee", "image" :  "data:image/svg+xml;base64,',
                Base64.encode(bytes(finalSvg)),
                '"}'
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        _setTokenURI(newItemId, finalTokenUri);

        emit NewEpicNFTMinted(msg.sender, newItemId);

        _tokenIds.increment();

    }

    function mintedSoFar() public view returns (uint256) {
        return _tokenIds.current();
    } 
}
