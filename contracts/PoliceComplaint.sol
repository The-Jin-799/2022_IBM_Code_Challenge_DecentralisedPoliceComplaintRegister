// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

contract PoliceComplaint {
    uint256 complaint_no = 0;
    struct ComplaintInfo {
        uint256 complaint_id;
        address complainer_address;
        address policestation_address;
        uint256 filed_date;
        bool complaint_accepted;
        uint256 accepted_date;
        bool fir_status;
        uint256 fir_date;
        bool mark_as_spam;
        uint256 markasspam_date;
        string spam_reason_doc;
        string complaint_doc_hash;
        string FIR_doc_hash;
    }

    ComplaintInfo[] Complaints;

    //Complainer filing complaint method
    function fileComplaint(
        address _policestationaddress,
        string memory _complaintDocHash
    ) public {
        ComplaintInfo memory Complaint;
        Complaint.complaint_id = complaint_no++;
        Complaint.complainer_address = msg.sender;
        Complaint.policestation_address = _policestationaddress;
        Complaint.filed_date = block.timestamp;
        Complaint.complaint_doc_hash = _complaintDocHash;
        Complaint.complaint_accepted = false;
        Complaint.fir_status = false;
        Complaint.mark_as_spam = false;
        Complaint.FIR_doc_hash = "";
        Complaints.push(Complaint);
    }

    //Police methods
    //set FIR status
    function setFir(uint256 _id, string memory _FIRdoc) public {
        require(Complaints[_id].policestation_address == msg.sender);
        Complaints[_id].fir_status = true;
        Complaints[_id].complaint_accepted = true;
        Complaints[_id].FIR_doc_hash = _FIRdoc;
        Complaints[_id].fir_date = block.timestamp;
        Complaints[_id].accepted_date = block.timestamp;
    }

    //set complaint acceptance
    function setAcceptance(uint256 _id) public {
        require(Complaints[_id].policestation_address == msg.sender);
        Complaints[_id].complaint_accepted = true;
        Complaints[_id].accepted_date = block.timestamp;
    }

    //set as spam
    function setSpam(uint256 _id, string memory _spamdoc) public {
        require(Complaints[_id].policestation_address == msg.sender);
        require(
            Complaints[_id].complaint_accepted != true &&
                Complaints[_id].fir_status != true
        );
        Complaints[_id].mark_as_spam = true;
        Complaints[_id].spam_reason_doc = _spamdoc;
        Complaints[_id].markasspam_date = block.timestamp;
    }

    //view method

    function getComplainerComplaints()
        public
        view
        returns (ComplaintInfo[] memory)
    {
        return (Complaints);
    }
}
