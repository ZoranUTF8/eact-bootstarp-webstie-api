const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors/index");
const moment = require("moment");
const EmployeeModel = require("../models/Employee");

const getEmployees = async (req, res) => {
  // We get allEmployees created by all admins, if we want to show only the one that are created by the logged in admin we can filter them here

  // Get all employees
  const queryObject = {};
  let result = EmployeeModel.find(queryObject);
  // Sort byt newest first
  result.sort("-createdAt");

  // Pagination
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const allEmployees = await result;

  if (!allEmployees) {
    throw new NotFoundError(`No employees found.`);
  }

  // Get total number of employees and number of pages
  const totalJobs = await EmployeeModel.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res
    .status(StatusCodes.OK)
    .json({ count: totalJobs, numOfPages, allEmployees });
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
  let employeesStats = await EmployeeModel.aggregate([
    // Stage 1: Get all employees added by all admins
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
  let monthlyApplication = await EmployeeModel.aggregate([
    // Stage 1: Get all employees added by all admins
    {
      $match: {},
    },
    // Stage 2: Group based on year and month
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    // Sort by descending year and month
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    // Limit to last six months
    { $limit: 12 },
  ]);
  // Format the date to year and month and return it
  monthlyApplication = monthlyApplication
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");

      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ monthlyApplication, employeesStats });
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  showStats,
};
