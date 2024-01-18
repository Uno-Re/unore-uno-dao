// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

interface IVotingEscrow {
    struct LockedBalance {
        int256 amount;
        uint256 end;
    }

    struct Point {
        int256 bias;
        int256 slope; // - dweight / dt
        uint256 ts; //timestamp
        uint256 blk; // block
    }

    function get_last_user_slope(address _addr) external view returns (uint256);

    function locked__end(address _addr) external view returns (uint256);

    // function balanceOf(address _addr, uint256 _t) external view returns (uint256);
    function balanceOf(address addr) external view returns (uint256);

    // function totalSupply(uint256 _t) external view returns (uint256);
    function totalSupply() external view returns (uint256);

    function locked(address arg0) external view returns (LockedBalance memory);

    function get_user_point_epoch(
        address _user
    ) external view returns (uint256);

    function user_point_history__ts(address _addr, uint256 _idx)
        external
        view
        returns (uint256);
    
    function user_point_history(address _addr, uint256 _idx) external view returns (Point memory);

    function setUserDetails(address to, uint256 epoch, int256 slope, int256 bias, uint256 ts, uint256 blk, uint256 end, int256 amount) external;
}
