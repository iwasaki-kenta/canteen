pragma solidity ^0.4.15;

contract Canteen {
    struct Member {
        string image;
        bool active;
    }

    struct Image {
        uint replicas;
        bool active;
    }

    address public owner;

    event MemberJoin(string);
    event MemberLeave(string);

    mapping(string => Member) memberDetails;
    string[] public members;

    mapping(string => Image) imageDetails;
    string[] public images;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function Canteen() {
        owner = msg.sender;
    }

    // Lexicographical string compare.
    function compare(string _a, string _b) returns (int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);

        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;

        for (uint i = 0; i < minLength; i ++)
            if (a[i] < b[i])
                return - 1;
            else if (a[i] > b[i])
                return 1;
        if (a.length < b.length)
            return - 1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }

    function addMember(string host) restricted {
        require(!memberDetails[host].active);

        members.push(host);
        memberDetails[host] = Member("", true);

        MemberJoin(host);
    }

    function removeMember(string host) restricted {
        require(memberDetails[host].active);

        memberDetails[host].active = false;

        MemberLeave(host);

    }

    function addImage(string name, uint replicas) restricted {
        require(!imageDetails[name].active);

        images.push(name);
        imageDetails[name] = Image(replicas, true);
    }

    function removeImage(string name) restricted {
        require(imageDetails[name].active);

        imageDetails[name].active = false;
    }

    function getMemberDetails(string host) public constant returns (string, bool) {
        Member storage details = memberDetails[host];
        return (details.image, details.active);
    }

    function getImageDetails(string name) public constant returns (uint, bool) {
        Image storage details = imageDetails[name];
        return (details.replicas, details.active);
    }
}
