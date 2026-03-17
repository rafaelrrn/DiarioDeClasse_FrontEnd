import { NextRequest, NextResponse } from 'next/server';


export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // rota pública
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // cookie httpOnly (setado pelo backend)
  const token = request.cookies.get('auth_token')?.value;

  // não logado
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }   

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};