import React from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const TeacherProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) { console.log(response) }
  else if (error) { console.log(error) }

  console.log(currentUser);
  const teachSclass = currentUser.teachSclass;
  const teachSubject = currentUser.teachSubject;
  const teachSchool = currentUser.school;

  // Function to join array elements with commas
  const joinWithCommas = (array) => {
    return array.map(item => item.sclassName).join(', ');
  };

  const joinWithCommas2 = (array) => {
    return array.map(item => item.subName).join(', ');
  };

  return (
    <>
      <ProfileCard>
        <div>
          <ProfileText>Name: {currentUser.name}</ProfileText>
          <ProfileText>Email: {currentUser.email}</ProfileText>
          {/* Displaying classes as comma-separated list */}
          <ProfileText>Class: {joinWithCommas(teachSclass)}</ProfileText>
          {/* Displaying subjects as comma-separated list */}
          <ProfileText>Subject: {joinWithCommas2(teachSubject)}</ProfileText>
          <ProfileText>School: {teachSchool.schoolName}</ProfileText>
        </div>
      </ProfileCard>
    </>
  );
};

export default TeacherProfile;

const ProfileCard = styled(Card)`
  margin: 20px;
  width: 600px;
  border-radius: 10px;
`;

const ProfileCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileText = styled(Typography)`
  margin: 10px;
`;
