'use client';
import { Autocomplete, TextField, ListSubheader, Popper } from '@mui/material';
import { isMissingValue } from 'src/utils/expense-calculations/missing-value';

const assetItems = [
  { category: 'Properties', label: 'The Landing', id: 'P1', units: 172 },
  { category: 'Properties', label: 'Edge At 1010', id: 'P2', units: 122 },
  { category: 'Properties', label: '2100 Springport', id: 'P3', units: 25 },
  { category: 'Properties', label: 'Sycamore Place', id: 'P4', units: 50 },
  { category: 'Home Office', label: 'Newbury Residential', id: 'H1', units: 122 },
];

export default function DropDownAsset({ allocation, handleAssetsChange, handleAllocationAmountChange, item, calculation }) {
  const calculateTotalUnits = (newValue) => {
    let newTotalUnits = item.allocations.reduce((total, alloc) => {
      return total + (alloc.id === allocation.id ? newValue?.units || 0 : alloc.asset?.units || 0);
    }, 0);

    let sumAllocatedAmount = 0;
    let allocationsLength = item.allocations.length;

    item.allocations.forEach((alloc, index) => {
      let unitsToUse = alloc.id === allocation.id ? (newValue ? newValue.units : 0) : alloc.asset?.units || 0;

      if (typeof unitsToUse === 'number') {
        let updatedAmount = (unitsToUse / newTotalUnits) * item.amount;
        updatedAmount = parseFloat(updatedAmount.toFixed(2));
        if (index === allocationsLength - 1) {
          let discrepancy = item.amount - sumAllocatedAmount - updatedAmount;
          updatedAmount += discrepancy;
          updatedAmount = parseFloat(updatedAmount.toFixed(2));
        } else {
          sumAllocatedAmount += updatedAmount;
        }
        if (calculation === 'Unit') {
          handleAllocationAmountChange(item.id, alloc.id, updatedAmount);
        }
      }
    });
  };

  const currentValue = allocation.asset ? allocation.asset : null;
  return (
    <Autocomplete
      PopperComponent={({ style, ...props }) => <Popper {...props} sx={{ ...style, height: 0 }} />}
      value={currentValue}
      defaultValue={null}
      onChange={(event, newValue) => {
        handleAssetsChange(item.id, allocation.id, newValue);
        calculateTotalUnits(newValue);
      }}
      id="grouped-asset-accounts"
      options={assetItems.sort((a, b) => b.category.localeCompare(a.category))}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => <TextField {...params} label="Location" error={item?.isSubmitted && isMissingValue(currentValue)} />}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.accountNumber}>
            {option.label}
          </li>
        );
      }}
      renderGroup={(params) => (
        <div key={params.key}>
          <ListSubheader sx={{ fontWeight: 'bold', color: 'primary.darker' }}>{params.group}</ListSubheader>
          {params.children}
        </div>
      )}
    />
  );
}
