import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components'; // Added missing import
import { LIST_ITEM_VARIANTS, STAGGER_CONTAINER } from '../styles/animations';

const GlassTable = ({ columns, data, onRowClick }) => {
  return (
    <TableContainer className="glass-panel">
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
        >
          <AnimatePresence>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'interactive' : ''}
                  variants={LIST_ITEM_VARIANTS}
                  layout
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <motion.tr variants={LIST_ITEM_VARIANTS}>
                <td colSpan={columns.length} className="text-center py-8 text-white/50">
                  No data available
                </td>
              </motion.tr>
            )}
          </AnimatePresence>
        </motion.tbody>
      </StyledTable>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  overflow-x: auto;
  padding: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border-glass-light);
    
    th {
      text-align: left;
      padding: 16px 24px;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      // Removed CSS transition to avoid conflict with framer-motion
      
      &:last-child {
        border-bottom: none;
      }
      
      &.interactive:hover {
        background: rgba(255, 255, 255, 0.04);
        cursor: pointer;
      }
      
      td {
        padding: 16px 24px;
        color: var(--text-primary);
        font-size: 14px;
      }
    }
  }
`;

export default GlassTable;
