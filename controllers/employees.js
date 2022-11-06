const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors/index");
const EmployeeModel = require("../models/Employee");

const getEmployees = async (req, res) => {
  // We get allEmployees created by all admins, if we want to show only the one that are created by the logged in admin we can filter them here
  const allEmployees = await EmployeeModel.find({}).sort("createdAt");

  if (!allEmployees) {
    throw new NotFoundError(`No employees found.`);
  }

  res.status(StatusCodes.OK).json({ count: allEmployees.length, allEmployees });
};

const getEmployee = async (req, res) => {
  /*
  Here we can get only the employees that 
  are created by the logged in admin
  or all the admins can see all the employees
  later we can add the first case if needed so by 
  adding the findOne({_id:jobId,createdBy:userId})
  userId we get from the req.user 
  */
  const { id: employeeId } = req.params;

  const employee = await EmployeeModel.findOne({ _id: employeeId });

  if (!employee) {
    throw new NotFoundError(`No employee found with id ${id}`);
  }

  res.status(StatusCodes.OK).json(employee);
};

const createEmployee = async (req, res) => {
  // add the id and name of the administrator who created the new employee and added them to the database
  req.body.addedById = req.user.userId;
  req.body.addedByName = req.user.userName;

  const returnedResult = await EmployeeModel.create(req.body);

  res.status(StatusCodes.CREATED).json({ returnedResult });
};

/*
Update employee properties with new employee properties
Get the employee id from the request params
*/
const updateEmployee = async (req, res) => {
  const {
    params: { id: employeeId },
    body: payload,
  } = req;

  const updatedEmployee = await EmployeeModel.findOneAndUpdate(
    { _id: employeeId },
    payload,
    { new: true, runValidators: true }
  );

  if (!updatedEmployee) {
    throw new BadRequestError(`No employee found with id ${employeeId}`);
  }

  res.status(StatusCodes.OK).json(updatedEmployee);
};

/*
Delete the employee 
Get the employee id from the request params
*/
const deleteEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  const deletedEmployee = await EmployeeModel.findOneAndDelete({
    _id: employeeId,
  });

  if (!deletedEmployee) {
    throw new NotFoundError(`No employee found with id `);
  }

  res.status(StatusCodes.OK).json({ id: employeeId });
};

const showStats = async (req, res) => {
  // Stage 1: Filter employee documents by AGE
  let employeesStats = await EmployeeModel.aggregate([
    {
      $match: {},
    },
    // Stage 2: Group remaining documents by status and count each status
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
    // Stage 3: Sort documents by age in descending order
    // {
    //   $sort: { dateToString: 1 },
    // },
  ]);

  // Add the status name and the count to a new object
  employeesStats = employeesStats.reduce((acc, curr) => {
    const { _id: status, total } = curr;

    acc[status] = total;

    return acc;
  }, {});

  // Default stats so we dont have to check for it at the frontend
  const defaultStats = {
    "not-employed": employeesStats["not-employed"] || 0,
    "sick-leave": employeesStats["sick-leave"] || 0,
    employed: employeesStats.employed || 0,
    suspended: employeesStats.suspended || 0,
  };

  // Monthly applications
  let monthlyApplication = [];

  res.status(StatusCodes.OK).json({ monthlyApplication,employeesStats });
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  showStats,
};
