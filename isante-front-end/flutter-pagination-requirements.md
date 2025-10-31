# Flutter Web Pagination System Requirements

## Overview
This document outlines the requirements for developing a pagination system in Flutter web that replicates the functionality of the existing React/TypeScript pagination implementation. The system should provide server-side pagination, sorting, and filtering capabilities for data tables and lists.

## Core Features

### 1. Pagination Hook/Controller
**Equivalent to `usePagination` hook**

#### Requirements:
- **State Management**: Manage pagination state including:
  - Current page number (0-based indexing)
  - Page size (items per page)
  - Sort field and direction
  - Search/filter terms

#### Functionality:
- **Initialization**: Accept initial values for page, size, and sort
- **Page Navigation**: Methods to change current page
- **Size Control**: Methods to change items per page with automatic reset to first page
- **Sorting**: Methods to change sort field/direction with automatic reset to first page
- **Reset**: Method to reset pagination to initial values
- **State Persistence**: Maintain pagination state across widget rebuilds

#### Technical Implementation:
```dart
class PaginationController extends ChangeNotifier {
  int _page = 0;
  int _size = 10;
  String _sort = '';
  String _searchTerm = '';
  
  // Getters and setters
  // Navigation methods
  // Reset functionality
}
```

### 2. Data Models

#### Pageable Model
**Equivalent to `Pageable` interface**

```dart
class Pageable {
  final int? page;
  final int? size;
  final String? sort;
  
  Pageable({
    this.page,
    this.size,
    this.sort,
  });
  
  Map<String, dynamic> toJson();
}
```

#### Page Response Model
**Equivalent to `Page<T>` interface**

```dart
class Page<T> {
  final List<T> content;
  final int totalElements;
  final int totalPages;
  final int size;
  final int number;
  final bool first;
  final bool last;
  final int numberOfElements;
  final bool empty;
  final Pageable pageable;
  final Sort sort;
  
  Page({
    required this.content,
    required this.totalElements,
    required this.totalPages,
    required this.size,
    required this.number,
    required this.first,
    required this.last,
    required this.numberOfElements,
    required this.empty,
    required this.pageable,
    required this.sort,
  });
  
  factory Page.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJson);
}
```

#### Sort Model
**Equivalent to `Sort` interface**

```dart
class Sort {
  final bool empty;
  final bool sorted;
  final bool unsorted;
  
  Sort({
    required this.empty,
    required this.sorted,
    required this.unsorted,
  });
  
  factory Sort.fromJson(Map<String, dynamic> json);
}
```

### 3. Pagination Widget

#### Requirements:
- **Visual Design**: Modern, responsive pagination controls
- **Navigation**: First, previous, next, last page buttons
- **Page Numbers**: Display current page and surrounding pages
- **Information Display**: Show "Showing X to Y of Z results"
- **Responsive**: Mobile-friendly design with collapsible controls
- **Accessibility**: Proper ARIA labels and keyboard navigation

#### Features:
- **Smart Page Display**: Show up to 5 page numbers around current page
- **Edge Handling**: Proper display when near first/last pages
- **Disabled States**: Disable navigation when at boundaries
- **Loading States**: Show loading indicators during page transitions

#### Technical Implementation:
```dart
class PaginationWidget extends StatelessWidget {
  final Page page;
  final Function(int) onPageChange;
  final String? className;
  
  // Widget implementation with responsive design
}
```

### 4. Data Table Component

#### Requirements:
- **Server-Side Pagination**: Fetch data based on pagination state
- **Sorting**: Column-based sorting with visual indicators
- **Search/Filter**: Text-based search with debouncing
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: Display error messages and retry options
- **Responsive**: Mobile-friendly table layout

#### Features:
- **Column Sorting**: Click headers to sort by column
- **Search Integration**: Real-time search with API integration
- **Size Selection**: Dropdown to change items per page
- **Row Actions**: Edit, delete, view actions per row
- **Bulk Actions**: Select multiple items for bulk operations

#### Technical Implementation:
```dart
class DataTableWidget<T> extends StatefulWidget {
  final Future<Page<T>> Function(Pageable) dataFetcher;
  final List<DataColumn> columns;
  final List<DataRow> Function(T) rowBuilder;
  final Widget Function(T)? actionBuilder;
  
  // Widget implementation with pagination integration
}
```

### 5. API Integration

#### Requirements:
- **HTTP Client**: Use `http` or `dio` package for API calls
- **Error Handling**: Proper error handling and user feedback
- **Loading States**: Show loading indicators during API calls
- **Caching**: Optional caching for better performance
- **Retry Logic**: Automatic retry on network failures

#### Implementation:
```dart
class ApiService {
  final String baseUrl;
  final http.Client _client;
  
  Future<Page<T>> getPaginatedData<T>(
    String endpoint,
    Pageable pageable,
    T Function(Map<String, dynamic>) fromJson,
  );
}
```

## Technical Requirements

### 1. State Management
- **Provider/Riverpod**: Use state management solution for pagination state
- **Reactive Updates**: Automatic UI updates when pagination state changes
- **State Persistence**: Maintain state across widget rebuilds

### 2. UI/UX Requirements
- **Material Design**: Follow Flutter Material Design guidelines
- **Responsive Design**: Work on desktop, tablet, and mobile
- **Dark Mode**: Support for light/dark theme
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Smooth scrolling and fast page transitions

### 3. Error Handling
- **Network Errors**: Handle connection issues gracefully
- **API Errors**: Display meaningful error messages
- **Validation**: Client-side validation for user inputs
- **Fallbacks**: Graceful degradation when features fail

### 4. Performance Requirements
- **Lazy Loading**: Load data only when needed
- **Debouncing**: Debounce search inputs to reduce API calls
- **Caching**: Cache paginated results when appropriate
- **Memory Management**: Proper disposal of controllers and listeners

## Dependencies

### Required Packages:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0  # For API calls
  provider: ^6.1.1  # For state management
  # OR
  flutter_riverpod: ^2.4.9  # Alternative state management
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.4  # For testing
```

## Testing Requirements

### Unit Tests:
- **Pagination Controller**: Test all state management methods
- **Data Models**: Test JSON serialization/deserialization
- **API Service**: Test API calls and error handling

### Widget Tests:
- **Pagination Widget**: Test navigation and display
- **Data Table**: Test sorting, filtering, and pagination
- **Integration**: Test complete pagination flow

### Integration Tests:
- **End-to-End**: Test complete user workflows
- **API Integration**: Test with real or mocked API
- **Performance**: Test with large datasets

## File Structure

```
lib/
├── models/
│   ├── pageable.dart
│   ├── page.dart
│   └── sort.dart
├── controllers/
│   └── pagination_controller.dart
├── services/
│   └── api_service.dart
├── widgets/
│   ├── pagination_widget.dart
│   ├── data_table_widget.dart
│   └── loading_widgets.dart
└── utils/
    ├── constants.dart
    └── helpers.dart
```

## Usage Example

```dart
class PatientsPage extends StatefulWidget {
  @override
  _PatientsPageState createState() => _PatientsPageState();
}

class _PatientsPageState extends State<PatientsPage> {
  late PaginationController _paginationController;
  
  @override
  void initState() {
    super.initState();
    _paginationController = PaginationController(
      initialPage: 0,
      initialSize: 10,
      initialSort: 'firstName,asc',
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Patients')),
      body: Column(
        children: [
          // Search and filters
          SearchAndFilterWidget(
            onSearch: (term) {
              _paginationController.setSearchTerm(term);
            },
            onSortChange: (sort) {
              _paginationController.setSort(sort);
            },
            onSizeChange: (size) {
              _paginationController.setSize(size);
            },
          ),
          
          // Data table
          Expanded(
            child: DataTableWidget<Patient>(
              dataFetcher: (pageable) => ApiService().getPatients(pageable),
              columns: [
                DataColumn(label: Text('Name')),
                DataColumn(label: Text('Contact')),
                DataColumn(label: Text('Actions')),
              ],
              rowBuilder: (patient) => [
                DataCell(Text('${patient.firstName} ${patient.lastName}')),
                DataCell(Text(patient.phone)),
                DataCell(PatientActionsWidget(patient: patient)),
              ],
            ),
          ),
          
          // Pagination
          PaginationWidget(
            page: _currentPage,
            onPageChange: (page) {
              _paginationController.setPage(page);
            },
          ),
        ],
      ),
    );
  }
}
```

## Success Criteria

1. **Functional Parity**: All features from React implementation work in Flutter
2. **Performance**: Smooth scrolling and fast page transitions
3. **Responsive**: Works well on all screen sizes
4. **Accessible**: Meets accessibility standards
5. **Testable**: Comprehensive test coverage
6. **Maintainable**: Clean, well-documented code
7. **Extensible**: Easy to add new features and data types

## Timeline Estimate

- **Week 1**: Core models and pagination controller
- **Week 2**: Pagination widget and basic UI
- **Week 3**: Data table component and API integration
- **Week 4**: Testing, refinement, and documentation

**Total**: 4 weeks for complete implementation 