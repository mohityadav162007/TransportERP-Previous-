from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from PIL import Image
import os
from coordinates import LOADING_SLIP, PAY_SLIP, MM

# Page Dimensions (Landscape A4)
PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)
SLIP_WIDTH = PAGE_WIDTH / 2
SLIP_HEIGHT = PAGE_HEIGHT

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')

def draw_text(c, text, x_mm, y_mm_from_top, offset_x=0):
    if text is None:
        text = ""
    text = str(text)
    
    # ReportLab coordinate system: (0,0) is bottom-left
    # We need to convert "y mm from top" to "y points from bottom"
    
    x = offset_x + (x_mm * MM)
    # y_from_bottom = TOTAL_HEIGHT - (y_from_top * MM)
    y = SLIP_HEIGHT - (y_mm_from_top * MM)
    
    # Baseline adjustment: subtract approx 3pt to aligning heavily on the line
    # (ReportLab text draws from baseline, so if y matches the line exactly, it sits on it)
    # y -= 2 
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, text)

def generate_pdf_buffer(trip_data, options, slip_numbers):
    import io
    buffer = io.BytesIO()
    
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    
    # 1. LEFT SIDE (Loading Slip)
    if options.get('left') == 'loading_slip':
        # Draw Background
        bg_path = os.path.join(TEMPLATE_DIR, 'loading_slip_template.png')
        if os.path.exists(bg_path):
            c.drawImage(bg_path, 0, 0, width=SLIP_WIDTH, height=SLIP_HEIGHT)
        
        # Prepare Data
        data = {
            "slip_no": slip_numbers.get('loading', 'PREVIEW'),
            "loading_date": format_date(trip_data.get('loading_date')),
            "party_name": trip_data.get('party_name'),
            "route_from": trip_data.get('from_location'),
            "route_to": trip_data.get('to_location'),
            "vehicle_no": trip_data.get('vehicle_number'),
            "weight": f"{trip_data.get('weight')} MT" if trip_data.get('weight') else "",
            "party_freight": format_money(trip_data.get('party_freight')),
            "party_advance": format_money(trip_data.get('party_advance')),
            "party_balance": format_money(trip_data.get('party_balance')),
            "remarks": trip_data.get('remark')
        }
        
        # Draw Fields
        for key, coords in LOADING_SLIP.items():
            if key in data:
                draw_text(c, data[key], coords[0], coords[1], offset_x=0)

    # 2. RIGHT SIDE (Pay Slip)
    if options.get('right') == 'pay_slip':
        offset_x = SLIP_WIDTH
        
        # Draw Background
        bg_path = os.path.join(TEMPLATE_DIR, 'pay_slip_template.png')
        if os.path.exists(bg_path):
            c.drawImage(bg_path, offset_x, 0, width=SLIP_WIDTH, height=SLIP_HEIGHT)
        
        # Prepare Data
        driver_mobile = trip_data.get('driver_number') or trip_data.get('motor_owner_number')
        
        data = {
            "slip_no": slip_numbers.get('pay', 'PREVIEW'),
            "loading_date": format_date(trip_data.get('loading_date')),
            "motor_owner": trip_data.get('motor_owner_name'),
            "driver_mobile": driver_mobile,
            "route_from": trip_data.get('from_location'),
            "route_to": trip_data.get('to_location'),
            "vehicle_no": trip_data.get('vehicle_number'),
            "weight": f"{trip_data.get('weight')} MT" if trip_data.get('weight') else "",
            "gaadi_freight": format_money(trip_data.get('gaadi_freight')),
            "gaadi_advance": format_money(trip_data.get('gaadi_advance')),
            "gaadi_balance": format_money(trip_data.get('gaadi_balance')),
            "remarks": trip_data.get('remark')
        }
        
        # Draw Fields
        for key, coords in PAY_SLIP.items():
            if key in data:
                draw_text(c, data[key], coords[0], coords[1], offset_x=offset_x)

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer

def format_date(date_str):
    if not date_str:
        return ""
    try:
        from datetime import datetime
        # Handle JS ISO format
        if 'T' in date_str:
            d = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            d = datetime.strptime(date_str, '%Y-%m-%d')
        return d.strftime('%d/%m/%Y')
    except:
        return date_str

def format_money(amount):
    if amount is None or amount == "":
        return ""
    try:
        return "{:,.0f}".format(float(amount))
    except:
        return str(amount)
