    pragma solidity ^0.4.15;

    contract Canteen {
        struct Member {
            string imageName;
            bool active;
        }

        struct Image {
            uint replicas;
            uint deployed;
            bool active;
        }

        address public owner;

        event MemberJoin(string host);
        event MemberLeave(string host);
        event MemberImageUpdate(string host, string image);

        mapping(bytes32 => Member) memberDetails;
        string[] public members;

        mapping(bytes32 => Image) imageDetails;
        string[] public images;
        mapping (bytes32 => uint[2][]) exposedPortsForImages;

        uint MULT = 100000;

        modifier restricted() {
            if (msg.sender == owner) _;
        }

        function Canteen() public {
            owner = msg.sender;
        }

        function addMember(string host) restricted public {
            bytes32 hashedHost = keccak256(host);
            require(!memberDetails[hashedHost].active);

            members.push(host);
            memberDetails[hashedHost] = Member("", true);

            MemberJoin(host);
            setImageForMember(host);
        }

        function removeMember(string host) restricted public {
            bytes32 hashedHost = keccak256(host);
            require(memberDetails[hashedHost].active);

            string memory affectedImage = memberDetails[hashedHost].imageName;

            imageDetails[keccak256(affectedImage)].deployed -= 1;
            memberDetails[hashedHost] = Member("", false);

            MemberLeave(host);

            // Need to rebalance
            // Eg. (A, 4), (B, 4) are two images. We have 4 members, and we remove 2
            // We now have A A null null -> We would need A B null null
            rebalanceWithUnfortunateImage(affectedImage);
        }

        function addImage(string name, uint replicas) restricted public {
            bytes32 hashedName = keccak256(name);
            require(!imageDetails[hashedName].active);
            require(bytes(name).length > 0);
            require(replicas > 0);

            images.push(name);
            imageDetails[hashedName] = Image(replicas, 0, true);

            // Need to rebalance
            // Eg. (A, 4) is one image. We have 4 members. Now we add (B, 4)
            // We now have A A A A -> We would need A B A B
            rebalanceWithUnfortunateImage(name);
        }

        function removeImage(string name) restricted public {
            bytes32 hashedName = keccak256(name);
            require(imageDetails[hashedName].active);

            imageDetails[hashedName].active = false;

            // Reassigns all the affected hosts to new images
            for (uint i = 0; i < members.length; i++) {
                Member storage member = memberDetails[keccak256(members[i])];
                if (member.active && keccak256(member.imageName) == hashedName) {
                    member.imageName = "";
                    setImageForMember(members[i]);
                }
            }
        }

        function addPortForImage(string name, uint from, uint to) restricted public {
            exposedPortsForImages[keccak256(name)].push([from, to]);
        }

         function getPortsForImage(string name) restricted public view returns (uint[2][]) {
            return exposedPortsForImages[keccak256(name)];
        }

        function getMemberDetails(string host) public constant returns (string, bool) {
            Member storage details = memberDetails[keccak256(host)];
            return (details.imageName, details.active);
        }

        function getImageDetails(string name) public constant returns (uint, uint, bool) {
            Image storage details = imageDetails[keccak256(name)];
            return (details.replicas, details.deployed, details.active);
        }

        function rebalanceWithUnfortunateImage(string newImageName) private {
            Image storage newImage = imageDetails[keccak256(newImageName)];
            uint currentRatio = 0;
            uint i;
            Member storage member;

            for (i = 0; i < members.length; i++) {
                if (newImage.deployed >= newImage.replicas)
                    break;

                member = memberDetails[keccak256(members[i])];
                // Looking for empty hosts and filling them up
                if (member.active && keccak256(member.imageName) == keccak256("")) {
                    member.imageName = newImageName;
                    newImage.deployed += 1;
                    currentRatio += (MULT / newImage.replicas);
                    MemberImageUpdate(members[i], newImageName);
                }
            }

            for (i = 0; i < members.length; i++) {
                if (newImage.deployed >= newImage.replicas)
                    break;

                member = memberDetails[keccak256(members[i])];
                // Now we are processing those hosts which already have images on them
                if (member.active && keccak256(member.imageName) != keccak256("")) {
                    // Only check if the machine has some other host running
                    if (keccak256(member.imageName) != keccak256(newImageName)) {
                        Image storage image = imageDetails[keccak256(member.imageName)];
                        uint ratio = (image.deployed * MULT) / image.replicas;
                        // if (ratio < currentRatio + (MULT / newImage.replicas)) {
                        if (ratio > currentRatio) {
                            member.imageName = newImageName;
                            newImage.deployed += 1;
                            image.deployed -= 1;
                            currentRatio += (MULT / newImage.replicas);
                            MemberImageUpdate(members[i], newImageName);
                        }
                    }
                }
            }
        }

        function setImageForMember(string host) private {
            string memory image = getNextImageToUse();
            bytes32 hashedHost = keccak256(host);
            bytes32 hashedImage = keccak256(image);
            if (hashedImage == keccak256("")) {
                return;
            }

            // Host currently has no image, and image hasn't reached its limit yet.
            require(keccak256(memberDetails[hashedHost].imageName) == keccak256(""));
            require(imageDetails[hashedImage].deployed < imageDetails[hashedImage].replicas);

            memberDetails[hashedHost] = Member(image, true);
            imageDetails[hashedImage].deployed += 1;
            MemberImageUpdate(host, image);
        }

        // Selects image with lowest usage, scales equal usage of all replicas,
        // with respect to the ratio of the replicas required.
        function getNextImageToUse() private view returns (string) {
            string memory bestImage = "";
            uint lowestUsage = MULT;

            for (uint i = 0; i < images.length; i++) {
                bytes32 hash = keccak256(images[i]);
                Image storage image = imageDetails[hash];

                if (image.deployed >= image.replicas)
                    continue;

                // deployed / usage < lowestUsage -> this has lower usage
                if (image.active && image.deployed < lowestUsage * image.replicas) {
                    lowestUsage = (image.deployed * MULT) / image.replicas;
                    bestImage = images[i];
                }
            }

            return bestImage;
        }

        function getMembersCount() public view returns (uint) {
            return members.length;
        }

        function getImagesCount() public view returns (uint) {
            return images.length;
        }
    }