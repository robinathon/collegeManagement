const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Student = require('../models/studentSchema.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const Docxtemplater = require('docxtemplater');


const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        console.log(email);
        const subjectObj = new mongoose.Types.ObjectId(teachSubject);
        const classObj = new mongoose.Types.ObjectId(teachSclass);

        let existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            existingTeacherByEmail.teachSubject.push(subjectObj);
            existingTeacherByEmail.teachSclass.push(classObj);

            console.log('Existing teacher found, updating...');

            // Use the updated teacher object
            await existingTeacherByEmail.save();

            await Subject.findByIdAndUpdate(teachSubject, { teacher: existingTeacherByEmail._id });

            // Populate teachSclass
            existingTeacherByEmail = await Teacher.findById(existingTeacherByEmail._id).populate('teachSclass', 'sclassName');

            if (!existingTeacherByEmail) {
                console.log("Teacher not found after update");
                return res.status(404).send({ error: "Teacher not found after update" });
            }

            existingTeacherByEmail.password = undefined;
            res.send({ data: existingTeacherByEmail });
        } else {
            const teacher = new Teacher({
                name: name,
                email: email,
                password: password,
                role: role,
                school: school,
                teachSubject: [], // Assuming teachSubject is an array of subject IDs
                teachSclass: [], // Assuming teachSclass is an array of class IDs
                attendance: [] // You can add attendance details later
            });

            teacher.teachSubject.push(teachSubject);
            teacher.teachSclass.push(classObj);

            await teacher.save();

            const teacherId = new mongoose.Types.ObjectId(teacher._id);

            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacherId });

            teacher.password = undefined;

            console.log("New teacher created:", teacher);

            // Populate teachSclass for the new teacher
            const populatedTeacher = await Teacher.findById(teacher._id).populate('teachSclass', 'sclassName');

            if (!populatedTeacher) {
                console.log("New teacher not found after creation");
                return res.status(404).send({ error: "New teacher not found after creation" });
            }

            console.log("TeachSclass populated for new teacher:", populatedTeacher.teachSclass);

            res.send({ data: populatedTeacher });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json(err);
    }
};


// const teacherRegister = async (req, res) => {
//     const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
//     try {
        
//         console.log(email);
//         const subjectObj = new mongoose.Types.ObjectId(teachSubject);
//         const classObj = new mongoose.Types.ObjectId(teachSclass);
//         const existingTeacherByEmail = await Teacher.findOne({ email });

//         if(existingTeacherByEmail){
//             existingTeacherByEmail.teachSubject.push(subjectObj);
//             existingTeacherByEmail.teachSclass.push(classObj);
//             // console.log(existingTeacherByEmail);
//             console.log('till this');
//             await existingTeacherByEmail.save();
//             await Subject.findByIdAndUpdate(teachSubject, { teacher: existingTeacherByEmail._id });
//             const populatedTeacher = await existingTeacherByEmail.findById(existingTeacherByEmail._id).populate('teachSclass', 'sclassName');
            
//             if (!populatedTeacher) {
//                 console.log("Teacher not found");
//                 return res.status(404).send({ error: "Teacher not found" });
//             }
//             existingTeacherByEmail.password = undefined;
//             res.send({data : existingTeacherByEmail});
//         }else{
//             const teacher = new Teacher({
//                 name: name,
//                 email: email,
//                 password: password,
//                 role: role,
//                 school: school,
//                 teachSubject: [], // Assuming teachSubject is an array of subject IDs
//                 teachSclass: [], // Assuming teachSclass is an array of class IDs
//                 attendance: [] // You can add attendance details later
//             });
            
//             teacher.teachSubject.push(teachSubject);
//             teacher.teachSclass.push(teachSclass);
            
//             await teacher.save();
            
//             const teacherId = new mongoose.Types.ObjectId(teacher._id);
            
//             await Subject.findByIdAndUpdate(teachSubject, { teacher: teacherId });
            
//             teacher.password = undefined;
            
//             console.log(teacher);
            
//             // Use .exec() without a callback
//             const populatedTeacher = await Teacher.findById(teacher._id).populate('teachSclass', 'sclassName');
            
//             if (!populatedTeacher) {
//                 console.log("Teacher not found");
//                 return res.status(404).send({ error: "Teacher not found" });
//             }
            
//             console.log(populatedTeacher.teachSclass);
            
//             res.send({ data: populatedTeacher });
            
//         }
        
//     } catch (err) {
//         console.log("error hai bhai");
//         res.status(500).json(err);
//     }
// };

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            if (req.body.password==teacher.password) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findById(
            teacherId
        );
        
        const sub = await Subject.findById(teachSubject);
        const classId = sub.sclassName;
        updatedTeacher.teachSubject.push(sub._id);
        updatedTeacher.teachSclass.push(classId);
        await updatedTeacher.save();
        // console.log(updatedTeacher);
        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};
const generateAttendanceDoc = async (students) => {
    try {
        const templatePath = path.resolve(__dirname, 'attendance_template.docx');
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);
        
        console.log("running");
        // Data to fill in the template
        const data = {
            students: students.map((student) => ({
                rollNo: student.rollNum,
                name: student.name,
                daysPresent: student.attendance.filter((day) => day.status === 'present').length
            }))
        };

        // Set the data into the template
        doc.setData(data);

        // Compile the template
        doc.compile();

        // Perform substitution
        doc.render();

        // Get the generated document as a buffer
        const generatedOutput = doc.getZip().generate({ type: 'nodebuffer' });

        // Output file path
        const outputPath = path.resolve(__dirname, 'attendance_output.docx');

        // Write the generated document to file
        fs.writeFileSync(outputPath, generatedOutput);

        return outputPath;
    } catch (error) {
        throw new Error(`Error generating attendance document: ${error.message}`);
    }
};


// const generateAttendanceDoc = async (students) => {
//     try {
//         const templatePath = path.join(__dirname, 'attendance_template.docx');
//         console.log("yes")
//         const content = fs.readFileSync(templatePath, 'binary');
//         const doc = new Docxtemplater();
//         doc.loadZip(content);

//         // Data to fill in the template
//         const data = students.map((student) => ({
//             rollNo: student.rollNum,
//             name: student.name,
//             daysPresent: student.attendance.filter((day) => (day.status=='present')).length
//         }));

//         doc.setData({ students: data });

//         doc.render();

//         const outputFilePath = path.join(__dirname, 'attendance_output.docx');
//         const outputPath = fs.writeFileSync(outputFilePath, doc.getZip().generate({ type: 'nodebuffer' }));

//         return outputPath;
//     } catch (error) {
//         throw new Error(`Error generating attendance document: ${error.message}`);
//     }
// };

const downloadAtt = async (req, res) =>{
    try {
        
        const students = await Student.find({sclassName: '65c9f98374e6209cd1f16769'});
        // console.log(students);
        console.log((students[0].attendance)[0].status);
        const data = {
            students: students.map((student) => ({
                rollNo: student.rollNum,
                name: student.name,
                daysPresent: student.attendance.filter((day) => day.status === 'Present' && day.subName=='65c9ffba74e6209cd1f16838').length
            }))
        };
        res.send(data);
        // const outputFilePath = await generateAttendanceDoc(students);

        // res.download(outputFilePath, 'attendance.docx', (err) => {
        //     if (err) {
        //         throw new Error(`Error downloading attendance document: ${err.message}`);
        //     } else {
        //         // Delete the generated file after download
        //         fs.unlinkSync(outputFilePath);
        //     }
        // });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    downloadAtt
};