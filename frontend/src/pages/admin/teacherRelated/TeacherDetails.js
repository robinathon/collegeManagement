// import React, { useEffect } from 'react';
// import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Button, Container, Typography } from '@mui/material';

// const TeacherDetails = () => {
//     const navigate = useNavigate();
//     const params = useParams();
//     const dispatch = useDispatch();
//     const { loading, teacherDetails, error } = useSelector((state) => state.teacher);
//     console.log(teacherDetails);

//     const teacherID = params.id;

//     useEffect(() => {
//         dispatch(getTeacherDetails(teacherID));
//     }, [dispatch, teacherID]);

//     if (error) {
//         console.log(error);
//     }

//     const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

//     const handleAddSubject = () => {
//         navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
//     };

//     return (
//         <>
//             {loading ? (
//                 <div>Loading...</div>
//             ) : (
//                 <Container>
//                     <Typography variant="h4" align="center" gutterBottom>
//                         Teacher Details
//                     </Typography>
//                     <Typography variant="h6" gutterBottom>
//                         Teacher Name: {teacherDetails?.name}
//                     </Typography>
//                     <Typography variant="h6" gutterBottom>
//                         Teacher Email: {teacherDetails?.email}
//                     </Typography>
//                     <Typography variant="h6" gutterBottom>
//                         Class Name: {teacherDetails?.teachSclass?.sclassName}
//                     </Typography>
//                     {isSubjectNamePresent ? (
//                         <>
//                             <Typography variant="h6" gutterBottom>
//                                 Subject Name: {teacherDetails?.teachSubject?.subName}
//                             </Typography>
//                             <Typography variant="h6" gutterBottom>
//                                 Subject Sessions: {teacherDetails?.teachSubject?.sessions}
//                             </Typography>
//                         </>
//                     ) : (
//                         <Button variant="contained" onClick={handleAddSubject}>
//                             Add Subject
//                         </Button>
//                     )}
//                 </Container>
//             )}
//         </>
//     );
// };

// export default TeacherDetails;

import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Typography } from '@mui/material';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.error('Error fetching teacher details:', error);
        return <div>Error fetching teacher details. Please try again later.</div>;
    }

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherID}`);
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container>
                    <Typography variant="h4" align="center" gutterBottom>
                        Teacher Details
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Teacher Name: {teacherDetails?.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Teacher Email: {teacherDetails?.email}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Institute: {teacherDetails?.school?.schoolName}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Classes:
                        {teacherDetails?.teachSclass?.map((sclass, index) => (
                            <span key={index}>{index > 0 ? ', ' : ' '}{sclass.sclassName}</span>
                        ))}
                    </Typography>
                    {teacherDetails?.teachSubject?.length > 0 ? (
                        <div>
                            <Typography variant="h6" gutterBottom>
                                Subjects:
                            </Typography>
                            {teacherDetails.teachSubject.map((subject, index) => (
                                <div key={index}>
                                    <Typography variant="h6" gutterBottom>
                                        - {subject.subName} ({subject.sessions} sessions)
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Button variant="contained" onClick={handleAddSubject}>
                            Add Subject
                        </Button>
                    )}
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;
