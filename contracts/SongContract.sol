// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SongContract {
    struct Song {
        string title;
        string ipfsHash; // IPFS hash for storing the song file off-chain
        address payable owner;
        uint256 rentPrice;
        address[] rentedBy; // List of addresses that rented the song
    }

    mapping(uint256 => Song) private songs; // Store songs with unique ID
    mapping(address => uint256[]) private ownerSongs; // List of song IDs owned by each artist
    mapping(uint256 => address) private songToOwner; // Map songs to their owners

    uint256 public songCount = 0; // Keep track of the number of songs

    event SongUploaded(uint256 songId, string title, address indexed owner);
    event SongRented(
        uint256 songId,
        address indexed renter,
        uint256 amountPaid
    );

    // Upload a new song
    function uploadSong(
        string memory _title,
        string memory _ipfsHash,
        uint256 _rentPrice
    ) public {
        require(bytes(_title).length > 0, "Song title is required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(_rentPrice > 0, "Rent price must be greater than zero");

        // Increment song count and create new song
        songCount++;
        songs[songCount] = Song({
            title: _title,
            ipfsHash: _ipfsHash,
            owner: payable(msg.sender),
            rentPrice: _rentPrice,
            rentedBy: new address[](0) // Initialize rentedBy as an empty array
        });

        // Add song ID to the artist's owned songs list
        ownerSongs[msg.sender].push(songCount);

        // Map song ID to the song owner
        songToOwner[songCount] = msg.sender;

        emit SongUploaded(songCount, _title, msg.sender);
    }

    // Rent a song
    function rentSong(uint256 _songId) public payable {
        require(_songId > 0 && _songId <= songCount, "Invalid song ID");
        Song storage song = songs[_songId];
        require(msg.value >= song.rentPrice, "Insufficient rent payment");

        // Pay the song owner
        song.owner.transfer(msg.value);

        // Ensure the same user can't rent the same song twice
        bool alreadyRented = false;
        for (uint256 i = 0; i < song.rentedBy.length; i++) {
            if (song.rentedBy[i] == msg.sender) {
                alreadyRented = true;
                break;
            }
        }
        require(!alreadyRented, "You already rented this song");

        // Add the renter to the list of people who rented the song
        song.rentedBy.push(msg.sender);

        emit SongRented(_songId, msg.sender, msg.value);
    }

    // Get all songs (visible to everyone)
    function getAllSongs() public view returns (Song[] memory) {
        Song[] memory allSongs = new Song[](songCount);
        for (uint256 i = 1; i <= songCount; i++) {
            allSongs[i - 1] = songs[i];
        }
        return allSongs;
    }

    // View all the renters for a particular song (only accessible to the owner of the song)
    function getSongRenters(
        uint256 _songId
    ) public view returns (address[] memory) {
        require(_songId > 0 && _songId <= songCount, "Invalid song ID");
        Song storage song = songs[_songId];
        require(
            msg.sender == song.owner,
            "Only the owner can view the renters"
        );

        return song.rentedBy;
    }

    // Get all songs owned by the caller
    function getMySongs() public view returns (Song[] memory) {
        uint256[] memory songIds = ownerSongs[msg.sender];
        Song[] memory mySongs = new Song[](songIds.length);
        for (uint256 i = 0; i < songIds.length; i++) {
            mySongs[i] = songs[songIds[i]];
        }
        return mySongs;
    }

    // Ensure only song owners can view their own list of renters (security measure)
    function getOwnerSongs() public view returns (Song[] memory) {
        uint256[] memory songIds = ownerSongs[msg.sender];
        Song[] memory mySongs = new Song[](songIds.length);
        for (uint256 i = 0; i < songIds.length; i++) {
            mySongs[i] = songs[songIds[i]];
        }
        return mySongs;
    }

    // Get the owner of a specific song
    function getSongOwner(uint256 _songId) public view returns (address) {
        require(_songId > 0 && _songId <= songCount, "Invalid song ID");
        return songToOwner[_songId];
    }
}
