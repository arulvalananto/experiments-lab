export function successResponse(data: any) {
    return {
        success: true,
        data,
    };
}

export function errorResponse(error: any) {
    return {
        success: false,
        error,
    };
}
