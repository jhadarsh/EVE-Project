class ApiResponse {
  static success({
    res,
    statusCode = 200,
    message = 'Request successful',
    data = null,
    meta = null,
  }) {
    const response = {
      success: true,
      message,
      data,
    };

    if (meta !== null) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static created({
    res,
    message = 'Resource created successfully',
    data = null,
    meta = null,
  }) {
    return ApiResponse.success({
      res,
      statusCode: 201,
      message,
      data,
      meta,
    });
  }

  static noContent({ res }) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;