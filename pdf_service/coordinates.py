# Conversion factor: 1 mm = 2.83465 points
MM = 2.83465

# Coordinates relative to the slip origin (0,0)
# Format: "key": (x, y)
# Note: ReportLab uses bottom-left origin, so Y must be calculated as (HEIGHT - y_from_top)
# BUT to match the mental model of "mm from top", I will accept (x_mm, y_mm_from_top)
# and convert it during drawing.

# Constants
SLIP_WIDTH_MM = 148.5
SLIP_HEIGHT_MM = 210

LOADING_SLIP = {
    "slip_no": (112, 35),     # Top Right Box
    "loading_date": (112, 42), # Below Number
    "party_name": (35, 64),   # Party Name Line
    "route_from": (35, 72),   # From
    "route_to": (85, 72),     # To
    "vehicle_no": (45, 80),   # Vehicle No
    "weight": (95, 80),       # Weight
    "party_freight": (80, 88),# Freight (Total)
    "party_advance": (35, 96),# Advance
    "party_balance": (80, 96),# Balance
    "remarks": (35, 110)      # Remarks area
}

PAY_SLIP = {
    "slip_no": (112, 35),     # Top Right Box
    "loading_date": (112, 42), # Below Number
    "motor_owner": (40, 64),  # Motor Owner Name
    "driver_mobile": (95, 64),# Driver Mobile
    "route_from": (35, 72),   # From
    "route_to": (85, 72),     # To
    "vehicle_no": (45, 80),   # Vehicle No
    "weight": (95, 80),       # Weight
    "gaadi_freight": (80, 88),# Freight (Total)
    "gaadi_advance": (35, 96),# Advance
    "gaadi_balance": (80, 96),# Balance
    "remarks": (35, 110)      # Remarks
}
