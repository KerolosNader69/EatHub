import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryGrid from './CategoryGrid';
import * as menuService from '../services/menuService';

// Mock the menuService
vi.mock('../services/menuService');

// Mock the CategoryCard component to simplify testing
vi.mock('./CategoryCard', () => ({
  default: ({ category, onClick }) => (
    <div 
      data-testid={`category-card-${category.id || category.name}`}
      onClick={() => onClick(category)}
    >
      {category.displayName || category.name}
    </div>
  )
}));

// Mock the SkeletonLoader
vi.mock('./SkeletonLoader', () => ({
  CategoryGridSkeleton: ({ count }) => (
    <div data-testid="category-grid-skeleton">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-testid={`skeleton-${i}`}>Loading...</div>
      ))}
    </div>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CategoryGrid Component', () => {
  const mockCategories = [
    {
      id: '1',
      name: 'Food',
      displayName: 'Food',
      itemCount: 25
    },
    {
      id: '2',
      name: 'Groceries',
      displayName: 'Groceries',
      itemCount: 15
    },
    {
      id: '3',
      name: 'Health & Beauty',
      displayName: 'Health & Beauty',
      itemCount: 8
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading skeleton while fetching categories', () => {
    menuService.getCategories.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<CategoryGrid />);
    
    expect(screen.getByTestId('category-grid-skeleton')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading categories')).toBeInTheDocument();
  });

  it('should render categories after successful fetch', async () => {
    menuService.getCategories.mockResolvedValue(mockCategories);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('category-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-3')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Health & Beauty')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    const errorMessage = 'Network error';
    menuService.getCategories.mockRejectedValue(new Error(errorMessage));
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load categories. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching categories when retry button is clicked', async () => {
    menuService.getCategories
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockCategories);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByTestId('category-card-1')).toBeInTheDocument();
    });
    
    expect(menuService.getCategories).toHaveBeenCalledTimes(2);
  });

  it('should render empty state when no categories are available', async () => {
    menuService.getCategories.mockResolvedValue([]);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByText('No categories available at the moment.')).toBeInTheDocument();
    });
  });

  it('should handle category click and navigate to filtered menu', async () => {
    const mockOnCategoryClick = vi.fn();
    menuService.getCategories.mockResolvedValue(mockCategories);
    
    renderWithRouter(<CategoryGrid onCategoryClick={mockOnCategoryClick} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('category-card-1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('category-card-1'));
    
    expect(mockOnCategoryClick).toHaveBeenCalledWith(mockCategories[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/menu/food');
  });

  it('should convert category names to proper route format', async () => {
    const categoryWithSpaces = {
      id: '4',
      name: 'Health & Beauty',
      displayName: 'Health & Beauty'
    };
    menuService.getCategories.mockResolvedValue([categoryWithSpaces]);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('category-card-4')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('category-card-4'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/menu/health_&_beauty');
  });

  it('should have proper accessibility attributes', async () => {
    menuService.getCategories.mockResolvedValue(mockCategories);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Food categories');
      
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(3);
      
      // Check grid positioning attributes
      expect(gridCells[0]).toHaveAttribute('aria-rowindex', '1');
      expect(gridCells[0]).toHaveAttribute('aria-colindex', '1');
      expect(gridCells[1]).toHaveAttribute('aria-rowindex', '1');
      expect(gridCells[1]).toHaveAttribute('aria-colindex', '2');
    });
  });

  it('should handle null or undefined categories gracefully', async () => {
    menuService.getCategories.mockResolvedValue(null);
    
    renderWithRouter(<CategoryGrid />);
    
    await waitFor(() => {
      expect(screen.getByText('No categories available at the moment.')).toBeInTheDocument();
    });
  });
});