export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public userMessage: string = '服务异常，请稍后重试'
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.userMessage }, { status: error.statusCode });
  }
  console.error('Unhandled error:', error);
  return Response.json({ error: '服务异常，请稍后重试' }, { status: 500 });
}
