# Supermarket POS System - Flow Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (React)"]
        Home[Home Page]
        Login[Login Page]
        Signup[Signup/User Management]
        Dashboard[Dashboard Overview]
        Products[Products Management]
        Sales[POS/Sales Page]
        Analytics[Analytics & Insights]
        Messages[Messaging System]
        Upload[Upload Data]
        Bill[Bill Generation]
    end
    
    subgraph Backend["Backend (Node.js + Express)"]
        Auth[Auth Controller]
        ProdCtrl[Product Controller]
        SaleCtrl[Sale Controller]
        CustCtrl[Customer Controller]
        MsgCtrl[Message Controller]
    end
    
    subgraph Database["MongoDB"]
        Users[(Users)]
        Products[(Products)]
        Sales[(Sales)]
        Customers[(Customers)]
        Messages[(Messages)]
    end
    
    Frontend -->|API Calls| Backend
    Backend -->|CRUD Operations| Database
```

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB
    
    User->>Frontend: Access Application
    Frontend->>Frontend: Check localStorage for token
    
    alt No Token
        Frontend->>User: Redirect to Login
        User->>Frontend: Enter Credentials
        Frontend->>Backend: POST /api/auth/login
        Backend->>MongoDB: Verify User
        MongoDB-->>Backend: User Data
        Backend-->>Frontend: JWT Token + User Info
        Frontend->>Frontend: Store in localStorage
        Frontend->>User: Redirect to Dashboard
    else Valid Token
        Frontend->>User: Show Dashboard
    end
```

## 3. Product Management Flow

```mermaid
flowchart TD
    Start([Admin/Staff Access Products Page]) --> View[View All Products]
    View --> Filter{Apply Filters?}
    Filter -->|All Products| ShowAll[Display All]
    Filter -->|Expiring Soon| ShowExpiring[Display Expiring Products]
    Filter -->|Expired| ShowExpired[Display Expired Products]
    
    View --> Action{Choose Action}
    Action -->|Add New| AddForm[Fill Product Form]
    AddForm --> AddDetails[Enter: Name, Barcode, Price, Stock, Category, Expiry]
    AddDetails --> Submit1[Submit to Backend]
    Submit1 --> DB1[(Save to MongoDB)]
    DB1 --> Refresh1[Refresh Product List]
    
    Action -->|Edit| EditForm[Modify Product Details]
    EditForm --> Submit2[Update Backend]
    Submit2 --> DB2[(Update MongoDB)]
    DB2 --> Refresh2[Refresh Product List]
    
    Action -->|Delete| Confirm[Confirm Deletion]
    Confirm --> Submit3[Delete Request]
    Submit3 --> DB3[(Remove from MongoDB)]
    DB3 --> Refresh3[Refresh Product List]
    
    Refresh1 --> End([Products Updated])
    Refresh2 --> End
    Refresh3 --> End
```

## 4. POS/Sales Transaction Flow

```mermaid
flowchart TD
    Start([Cashier Opens Sales Page]) --> Init[Initialize Cart]
    Init --> Search{Search Product}
    
    Search -->|Manual Search| TypeName[Type Product Name]
    Search -->|Barcode Scan| OpenCamera[Open Barcode Camera]
    
    OpenCamera --> CamMode{Choose Mode}
    CamMode -->|Camera| Capture[Capture from Camera]
    CamMode -->|Upload| Upload[Upload Image]
    Capture --> OCR[OCR Read Barcode]
    Upload --> OCR
    OCR --> FindProd[Find Product by Barcode]
    
    TypeName --> FindProd
    FindProd --> CheckStock{Stock Available?}
    CheckStock -->|No| Error[Show Error]
    CheckStock -->|Yes| AddCart[Add to Cart]
    
    AddCart --> ShowCart[Display Cart Items]
    ShowCart --> Modify{Modify Cart?}
    Modify -->|Add More| Search
    Modify -->|Remove Item| RemoveItem[Remove from Cart]
    RemoveItem --> ShowCart
    Modify -->|Change Qty| UpdateQty[Update Quantity]
    UpdateQty --> ShowCart
    
    Modify -->|Checkout| CustInfo[Enter Customer Info]
    CustInfo --> CustDetails[Phone Number & Name]
    CustDetails --> Payment[Select Payment Method]
    Payment --> PayType{Payment Type}
    PayType -->|Cash| ProcessCash[Process Cash Payment]
    PayType -->|Card| ProcessCard[Process Card Payment]
    PayType -->|UPI| ProcessUPI[Process UPI Payment]
    
    ProcessCash --> Complete[Complete Transaction]
    ProcessCard --> Complete
    ProcessUPI --> Complete
    
    Complete --> Backend[Send to Backend]
    Backend --> UpdateDB[(Update Database)]
    UpdateDB --> UpdateStock[Reduce Stock]
    UpdateDB --> CreateSale[Create Sale Record]
    UpdateDB --> UpdateCustomer[Update Customer Points & Tier]
    
    UpdateCustomer --> GenBill[Generate Bill]
    GenBill --> ShowBill[Display Bill with QR]
    ShowBill --> End([Transaction Complete])
```

## 5. Customer Loyalty System Flow

```mermaid
flowchart TD
    Start([Sale Transaction]) --> CheckCust{Customer Exists?}
    CheckCust -->|No| CreateCust[Create New Customer]
    CheckCust -->|Yes| GetCust[Get Customer Data]
    
    CreateCust --> CalcPoints[Calculate Loyalty Points]
    GetCust --> CalcPoints
    
    CalcPoints --> Formula[Points = Total Amount × 0.1]
    Formula --> AddPoints[Add Points to Customer]
    AddPoints --> CheckTier{Check Tier Upgrade}
    
    CheckTier --> TierCalc[Total Points Check]
    TierCalc --> Tier1{Points >= 1000?}
    Tier1 -->|No| Bronze[Bronze Tier]
    Tier1 -->|Yes| Tier2{Points >= 5000?}
    Tier2 -->|No| Silver[Silver Tier]
    Tier2 -->|Yes| Gold[Gold Tier]
    
    Bronze --> UpdateTier[Update Customer Tier]
    Silver --> UpdateTier
    Gold --> UpdateTier
    
    UpdateTier --> SaveDB[(Save to MongoDB)]
    SaveDB --> End([Customer Updated])
```

## 6. Bulk Data Upload Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant MongoDB
    
    Admin->>Frontend: Upload Excel File
    Frontend->>Frontend: Read Excel Data
    Frontend->>Backend: POST /api/sales/analyze-transactions
    Backend->>Backend: Validate Columns
    Backend->>MongoDB: Check Products Exist
    Backend->>MongoDB: Check Stock Availability
    Backend-->>Frontend: Analysis Results
    
    Frontend->>Admin: Show Preview Modal
    Admin->>Frontend: Confirm Upload
    
    Frontend->>Backend: POST /api/sales/upload-transactions
    
    loop For Each Transaction
        Backend->>MongoDB: Check/Create Customer
        Backend->>MongoDB: Update Loyalty Points
        Backend->>MongoDB: Create Sale Record
        Backend->>MongoDB: Reduce Product Stock
    end
    
    Backend-->>Frontend: Upload Complete
    Frontend->>Admin: Show Success Message
```

## 7. Analytics & Insights Flow

```mermaid
flowchart TD
    Start([Admin Opens Analytics]) --> Loading[Show Loading Animation]
    Loading --> FetchData[Fetch Analytics Data]
    
    FetchData --> GetSales[Get Sales Data]
    FetchData --> GetProducts[Get Product Data]
    FetchData --> GetCustomers[Get Customer Data]
    
    GetSales --> CalcMetrics[Calculate Metrics]
    GetProducts --> CalcMetrics
    GetCustomers --> CalcMetrics
    
    CalcMetrics --> Revenue[Total Revenue]
    CalcMetrics --> SalesCount[Total Sales]
    CalcMetrics --> AvgSale[Average Sale Value]
    CalcMetrics --> TopProducts[Top Selling Products]
    CalcMetrics --> PaymentDist[Payment Method Distribution]
    CalcMetrics --> CategorySales[Category-wise Sales]
    CalcMetrics --> Trends[Sales Trends]
    
    Revenue --> Display[Display Dashboard]
    SalesCount --> Display
    AvgSale --> Display
    TopProducts --> Display
    PaymentDist --> Display
    CategorySales --> Display
    Trends --> Display
    
    Display --> Charts[Render Charts & Graphs]
    Charts --> End([Analytics Ready])
```

## 8. Messaging System Flow

```mermaid
flowchart TD
    Start([User Opens Messages]) --> LoadContacts[Load Contact List]
    LoadContacts --> ShowUsers[Display All Users]
    
    ShowUsers --> Select[Select Contact]
    Select --> LoadMsgs[Load Message History]
    LoadMsgs --> Display[Display Chat]
    
    Display --> Action{User Action}
    Action -->|Type Message| Compose[Compose Message]
    Compose --> Send[Click Send]
    Send --> Backend[POST /api/messages]
    Backend --> SaveDB[(Save to MongoDB)]
    SaveDB --> Refresh[Refresh Chat]
    Refresh --> Display
    
    Action -->|Delete Message| ConfirmDel[Confirm Delete]
    ConfirmDel --> DelBackend[DELETE /api/messages/:id]
    DelBackend --> RemoveDB[(Remove from MongoDB)]
    RemoveDB --> Refresh
    
    Action -->|Switch Contact| Select
```

## 9. User Management Flow (Admin Only)

```mermaid
flowchart TD
    Start([Admin Opens Signup Page]) --> View[View User Management Section]
    View --> LoadUsers[Load All Staff/Cashier Accounts]
    LoadUsers --> Display[Display User Table]
    
    Display --> Action{Choose Action}
    
    Action -->|Add New User| Form[Fill Signup Form]
    Form --> Details[Enter: Name, Email, Password, Role]
    Details --> Submit1[Submit to Backend]
    Submit1 --> Create[(Create User in MongoDB)]
    Create --> Refresh1[Refresh User List]
    
    Action -->|Deactivate| Confirm1[Confirm Deactivation]
    Confirm1 --> Update1[PATCH /api/auth/users/:id/status]
    Update1 --> SetInactive[(Set isActive = false)]
    SetInactive --> Refresh2[Refresh User List]
    
    Action -->|Activate| Update2[PATCH /api/auth/users/:id/status]
    Update2 --> SetActive[(Set isActive = true)]
    SetActive --> Refresh3[Refresh User List]
    
    Action -->|Delete| Confirm2[Confirm Deletion]
    Confirm2 --> Delete[DELETE /api/auth/users/:id]
    Delete --> Remove[(Remove from MongoDB)]
    Remove --> Refresh4[Refresh User List]
    
    Refresh1 --> End([Users Updated])
    Refresh2 --> End
    Refresh3 --> End
    Refresh4 --> End
```

## 10. Dashboard Overview Flow

```mermaid
flowchart TD
    Start([User Logs In]) --> CheckRole{Check User Role}
    
    CheckRole -->|Admin| AdminDash[Admin Dashboard]
    CheckRole -->|Staff| StaffDash[Staff Dashboard]
    CheckRole -->|Cashier| CashierDash[Cashier Dashboard]
    
    AdminDash --> LoadAll[Load All Metrics]
    LoadAll --> ShowMetrics[Show: Revenue, Sales, Products, Customers]
    ShowMetrics --> ShowCharts[Show: Sales Chart, Top Products]
    ShowCharts --> ShowAlerts[Show: Low Stock, Expiring Products]
    ShowAlerts --> ShowRecent[Show: Recent Sales]
    
    StaffDash --> LoadStaff[Load Staff Metrics]
    LoadStaff --> ShowStaffData[Show: Products, Sales Data]
    
    CashierDash --> LoadCashier[Load Cashier Metrics]
    LoadCashier --> ShowCashierData[Show: Today's Sales]
    
    ShowRecent --> Actions{Quick Actions}
    ShowStaffData --> Actions
    ShowCashierData --> Actions
    
    Actions -->|View Products| NavProducts[Navigate to Products]
    Actions -->|Make Sale| NavSales[Navigate to Sales]
    Actions -->|View Analytics| NavAnalytics[Navigate to Analytics]
    Actions -->|Upload Data| NavUpload[Navigate to Upload]
    Actions -->|Messages| NavMessages[Navigate to Messages]
```

## Key Features Summary

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, Cashier)
- Protected routes

### Product Management
- CRUD operations
- Barcode scanning (OCR)
- Stock tracking
- Expiry date monitoring
- Category management
- Discount/offer system

### Sales/POS System
- Real-time product search
- Barcode scanning (camera/upload)
- Cart management
- Multiple payment methods (cash, card, UPI)
- Customer tracking
- Bill generation with QR code

### Customer Relationship Management
- Customer profiles
- Loyalty points system
- Tier-based rewards (Bronze, Silver, Gold)
- Purchase history

### Analytics & Reporting
- Revenue tracking
- Sales trends
- Top products analysis
- Payment method distribution
- Category-wise performance
- Custom date range filtering

### Bulk Data Operations
- Excel file upload
- Transaction import
- Data validation
- Preview before commit

### Communication
- Internal messaging system
- User-to-user chat
- Message history

### User Management
- Add/edit/delete users
- Activate/deactivate accounts
- Role assignment
- Staff monitoring
