'use client';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';

import TablePagination from '@mui/material/TablePagination';

import RowItem from './RowItem';
import { isIncorrectAmounts, isMissingValue } from 'src/utils/expense-calculations/missing-value';
import updateTransactions from 'src/utils/services/CCExpenses/updateTransactions';

export default function CustomTable({ vendors, chartOfAccounts, unapprovedTransactions }) {
  const [transactions, setTransactions] = useState(() =>
    unapprovedTransactions.map((transaction) => ({
      ...transaction,
      checked: false,
    }))
  );
  console.log(transactions);
  const haveSelected = transactions.some((transaction) => transaction.checked);
  const selectedTransactions = transactions.reduce((count, transaction) => {
    return transaction.checked ? count + 1 : count;
  }, 0);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCheckboxToggle = useCallback((transactionId) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, checked: !transaction.checked } : transaction
      )
    );
  }, []);

  const handleAllocationAmountChange = useCallback((transactionId, allocationId, newAmount) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              allocations: transaction.allocations.map((allocation) =>
                allocation.id === allocationId ? { ...allocation, amount: newAmount } : allocation
              ),
            }
          : transaction
      )
    );
  }, []);

  const handleAddSplit = useCallback((transactionId, newAllocationId, isAmountCalculation = true) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              allocations: [
                ...transaction.allocations.map((allocation) => ({
                  ...allocation,
                  amount: 0,
                })),
                { id: newAllocationId, amount: 0, glAccount: null, note: '', vendor: null, assets: [] },
              ],
            }
          : transaction
      )
    );
  }, []);

  const handleDeleteSplit = useCallback((transactionId, allocationId) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => {
        if (transaction.id === transactionId) {
          const newAllocations = transaction.allocations.filter((allocation) => allocation.id !== allocationId);

          if (newAllocations.length === 1) {
            newAllocations[0].amount = transaction.amount;
          } else {
            newAllocations.forEach((allocation) => (allocation.amount = 0));
          }

          return {
            ...transaction,
            allocations: newAllocations,
          };
        }
        return transaction;
      })
    );
  }, []);

  const handleGlAccountChange = useCallback((transactionId, allocationId, newGlAccount) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              allocations: transaction.allocations.map((allocation) =>
                allocation.id === allocationId ? { ...allocation, glAccount: newGlAccount } : allocation
              ),
            }
          : transaction
      )
    );
  }, []);

  const handleAssetsChange = useCallback((transactionId, allocationId, newAsset) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              allocations: transaction.allocations.map((allocation) =>
                allocation.id === allocationId ? { ...allocation, asset: newAsset } : allocation
              ),
            }
          : transaction
      )
    );
  }, []);

  const handleVendorChange = useCallback((transactionId, newVendor) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              vendor: newVendor,
            }
          : transaction
      )
    );
  }, []);

  const handleNoteChange = useCallback((transactionId, allocationId, newNote) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              allocations: transaction.allocations.map((allocation) =>
                allocation.id === allocationId ? { ...allocation, note: newNote } : allocation
              ),
            }
          : transaction
      )
    );
  }, []);

  const handleReceiptChange = useCallback((transactionId, fileUrl, tempPdfUrl) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              receipt: fileUrl,
              tempPdfReceipt: tempPdfUrl,
            }
          : transaction
      )
    );
  }, []);

  function setTransactionSubmitted(transactionId) {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => (transaction.id === transactionId ? { ...transaction, isSubmitted: true } : transaction))
    );
  }

  const handleApproveTransactions = async () => {
    let validTransactions = [];
    transactions.forEach((transaction) => {
      if (transaction.checked) {
        let transactionValid = true;
        const errors = [];
        setTransactionSubmitted(transaction.id);

        const isVendorRequired = transaction.allocations.some(
          (allocation) => allocation.asset && allocation.asset.accountingSoftware === 'entrata'
        );

        if (isVendorRequired && isMissingValue(transaction.vendor)) {
          transactionValid = false;
          errors.push(`Item ID: ${transaction.id} is missing vendor`);
        }

        if (isIncorrectAmounts(transaction)) {
          transactionValid = false;
          errors.push(`Item ID: ${transaction.id} has incorrect allocations`);
        }

        transaction.allocations.forEach((allocation) => {
          let missingFields = [];
          if (isMissingValue(allocation.asset)) missingFields.push('assets');
          if (isMissingValue(allocation.glAccount)) missingFields.push('glAccount');

          if (missingFields.length > 0) {
            errors.push(`Allocation ID ${allocation.id} is missing: ${missingFields.join(', ')}`);
            transactionValid = false;
          }
        });
        if (transactionValid) {
          console.log('valid');
          return;
          validTransactions.push({ ...transaction, status: 'reviewed' });
        } else {
          console.log(errors.join('\n'));
        }
      }
    });
    if (validTransactions.length > 0) {
      try {
        const response = await updateTransactions(validTransactions);
        if (response.ids.length > 0) {
          const updatedTransactionIds = response.ids;
          setTransactions((prevTransactions) => prevTransactions.filter((transaction) => !updatedTransactionIds.includes(transaction.id)));
        }
      } catch (error) {
        console.error('Error Updating Transactions: ', error);
      }
    }
  };

  return (
    <Card sx={{ borderRadius: '10px' }}>
      <CardActions sx={{ backgroundColor: 'primary.darker' }}>
        <Button
          variant="contained"
          style={{ marginLeft: '16px', width: '140px' }}
          disabled={!haveSelected}
          onClick={handleApproveTransactions}
          color="primary"
        >
          Approve {selectedTransactions > 0 && `(${selectedTransactions})`}
        </Button>
        <TablePagination
          sx={{ color: 'white' }}
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardActions>
      <TableContainer component={Paper} sx={{ maxHeight: '72vh', height: '72vh', borderRadius: '0px', overflowX: 'hidden' }}>
        <Box sx={{ maxHeight: '72vh', height: '72vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
            <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <RowItem
                item={item}
                index={index}
                vendors={vendors}
                chartOfAccounts={chartOfAccounts}
                handleAllocationAmountChange={handleAllocationAmountChange}
                handleAddSplit={handleAddSplit}
                handleDeleteSplit={handleDeleteSplit}
                handleGlAccountChange={handleGlAccountChange}
                handleReceiptChange={handleReceiptChange}
                handleNoteChange={handleNoteChange}
                handleVendorChange={handleVendorChange}
                handleAssetsChange={handleAssetsChange}
                handleCheckboxToggle={handleCheckboxToggle}
              />
            </Box>
          ))}
        </Box>
      </TableContainer>
    </Card>
  );
}
