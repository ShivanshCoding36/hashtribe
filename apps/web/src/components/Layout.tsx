import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-black text-grey-200 font-sans selection:bg-white/20">
            <Header />

            <div className="pt-16 flex">
                <Sidebar />

                <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
