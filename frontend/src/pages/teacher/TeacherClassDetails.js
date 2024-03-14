import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents , getSubjectDetails} from '../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../redux/studentRelated/studentHandle';

import {
  Paper,
  Box,
  Typography,
  ButtonGroup,
  Button,
  Grid,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from '@mui/material';
import { BlackButton, BlueButton } from '../../components/buttonStyles';
import TableTemplate from '../../components/TableTemplate';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const TeacherClassDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sclassStudents, loading, error, getresponse } = useSelector(
    (state) => (state.sclass)
  );

  const { currentUser } = useSelector((state) => state.user);
  const { subjectDetails } = useSelector((state) => state.sclass);


  const classID = currentUser.teachSclass[0]?._id;
  const subjectID = currentUser.teachSubject[0]?._id;
  
  // const subName =  axios.get(`${process.env.REACT_APP_BASE_URL}/Subject/${subject
  // console.log(subName);
  useEffect(() => {
    dispatch(getClassStudents(classID));
    dispatch(getSubjectDetails(subjectID, 'Subject'));
  }, [dispatch, classID]);

  if (error) {
    console.log(error);
  }

  const studentColumns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
  ];

  // State variable to store attendance message for each student
  const [attendanceMessages, setAttendanceMessages] = useState({});

  const studentRows = sclassStudents.map((student) => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  }));

  const handleAttendanceMessage = (status, studentId) => {
    const message = status === 'Present' ? 'Marked present' : 'Marked absent';
    setAttendanceMessages((prevMessages) => ({
      ...prevMessages,
      [studentId]: message,
    }));
  };

  const handleAttStatus = (status, studentId) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    const fields = { subName: subjectID, status, date };
    console.log(fields);
    dispatch(updateStudentFields(studentId, fields, 'StudentAttendance'));
    handleAttendanceMessage(status, studentId); // Update the message based on status
  };

  const StudentsButtonHaver = ({ row }) => {
    const options = ['Take Attendance', 'Provide Marks'];

    const handleMarks = () => {
      navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)
    };

    return (
      <>
        <BlueButton
          variant="contained"
          onClick={() => navigate('/Teacher/class/student/' + row.id)}
        >
          View
        </BlueButton>
        <ButtonGroup variant="contained" aria-label="split button">
          
          <BlackButton
            size="small"
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={()=> handleMarks()}
          >
            {options[1]}
          </BlackButton>
        </ButtonGroup>
        <Grid container spacing={2}>
          <Grid item>
            <Button onClick={() => handleAttStatus('Present', row.id)}>P</Button>
          </Grid>
          <Grid item>
            <Button onClick={() => handleAttStatus('Absent', row.id)}>A</Button>
          </Grid>
        </Grid>
        <Box>
          {attendanceMessages[row.id] && (
            <Typography
              variant="body2"
              style={{
                color: attendanceMessages[row.id] === 'Marked present' ? 'green' : 'red',
              }}
            >
              {attendanceMessages[row.id]}
            </Typography>
          )}
        </Box>
      </>
    );
  };

  const handleDownload = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/downloadAttendance`, {
            responseType: 'blob'
        });
        
        console.log(response); // This will show the Blob object
        
        const url = window.URL.createObjectURL(response.data);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'attendance.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a); // Clean up the element after download
    } catch (error) {
        console.error('Error downloading attendance:', error);
    }
};


  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          
          <Typography variant="h4" align="center" gutterBottom>
            
              {subjectDetails.subName}
            
          </Typography>
          {getresponse ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '16px',
                }}
              >
                No Students Found
              </Box>
            </>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Typography variant="h5" gutterBottom>
                Students List:
              </Typography>
              <Button onClick={()=> handleDownload()}>
                download
              </Button>
              {Array.isArray(sclassStudents) && sclassStudents.length > 0 && (
                <TableTemplate
                  buttonHaver={StudentsButtonHaver}
                  columns={studentColumns}
                  rows={studentRows}
                />
              )}
            </Paper>
          )} 
        </>
      )}
    </>
  );
};

export default TeacherClassDetails;
