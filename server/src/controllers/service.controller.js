const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const Service = require('../models/Service');

exports.getServices = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  const services = await Service.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  success(res, services);
});

exports.getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ sortOrder: 1, createdAt: 1 });
  success(res, services);
});

exports.createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  created(res, service, 'Service created');
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) return error(res, 'Service not found', 404);
  success(res, service, 'Service updated');
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return error(res, 'Service not found', 404);
  success(res, null, 'Service deleted');
});
