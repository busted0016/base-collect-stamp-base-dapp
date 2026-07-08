// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseCollectStamp {
    uint256 public constant MAX_THEME_ID = 6;

    mapping(address => mapping(uint256 => bool)) private walletStamps;
    mapping(address => uint256) private walletProgress;
    mapping(uint256 => uint256) private themeClaimCounts;

    event StampClaimed(address indexed account, uint256 indexed themeId);

    function claimStamp(uint256 themeId) external {
        require(themeId > 0 && themeId <= MAX_THEME_ID, "Invalid theme");
        require(!walletStamps[msg.sender][themeId], "Stamp already claimed");

        walletStamps[msg.sender][themeId] = true;
        walletProgress[msg.sender] += 1;
        themeClaimCounts[themeId] += 1;

        emit StampClaimed(msg.sender, themeId);
    }

    function hasStamp(address account, uint256 themeId) external view returns (bool) {
        return walletStamps[account][themeId];
    }

    function getStampProgress(address account) external view returns (uint256) {
        return walletProgress[account];
    }

    function getThemeClaimCount(uint256 themeId) external view returns (uint256) {
        return themeClaimCounts[themeId];
    }
}
