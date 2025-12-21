import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppSidebar } from './AppSidebar'

// Mock dependencies
vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
    useRouter: () => ({ push: vi.fn() })
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>
}))

// Mock Auth wrapper since AppSidebar uses useAuth
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
        signOut: vi.fn(),
    })
}))

// Mock Icons to avoid rendering issues in test environment
vi.mock('lucide-react', () => ({
    LayoutDashboard: () => <span data-testid="icon-dashboard" />,
    BarChart3: () => <span data-testid="icon-analytics" />,
    Settings: () => <span data-testid="icon-settings" />,
    Zap: () => <span />,
    Activity: () => <span />,
    Building2: () => <span />,
    Kanban: () => <span />,
    TrendingUp: () => <span />,
    Target: () => <span />,
    Calendar: () => <span />,
    FileText: () => <span />,
    MessageSquare: () => <span />,
    Sparkles: () => <span />,
    LogOut: () => <span />,
    User: () => <span />,
    ChevronDown: () => <span />,
    FlaskConical: () => <span data-testid="icon-flask" />,
}))

// Mock DropdownMenu and Avatar to avoid Radix UI issues in JSDOM
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }) => <div>{children}</div>,
    DropdownMenuLabel: ({ children }) => <div>{children}</div>,
    DropdownMenuItem: ({ children }) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }) => <div>{children}</div>,
    AvatarImage: () => <img alt="avatar" />,
    AvatarFallback: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/system/TestRunnerDialog', () => ({
    TestRunnerDialog: ({ children }) => <div>{children}</div>
}));

describe('AppSidebar', () => {
    it('renders navigation links', () => {
        render(<AppSidebar />)
        // Check Logo
        expect(screen.getByText('Nexus CRM')).toBeInTheDocument()

        // Check Links exist using Role
        const links = screen.getAllByRole('link')
        expect(links.length).toBeGreaterThan(5) // Ensure navigation rendered
    })

    it('highlights the active link', () => {
        const { container } = render(<AppSidebar />)
        // Find link by href attribute directly
        const dashboardLink = container.querySelector('a[href="/dashboard"]')
        const settingsLink = container.querySelector('a[href="/settings"]')

        expect(dashboardLink).toBeInTheDocument()
        expect(dashboardLink).toHaveClass('nav-item-active')

        expect(settingsLink).toBeInTheDocument()
        expect(settingsLink).not.toHaveClass('nav-item-active')
    })

    it('displays user profile info', () => {
        render(<AppSidebar />)
        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
})
