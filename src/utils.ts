function hasE2xgraderCellTypeChanged(change: any) {
  if (change.key !== 'extended_cell') {
    return false;
  }

  if (change.type === 'remove') {
    return true;
  }

  // check if the new value has a key 'type'
  if (!change.newValue?.type) {
    return false;
  }

  // check if there is an old value and if it has a key 'type' and if it is different from the new value
  if (change.oldValue?.type && change.oldValue.type === change.newValue.type) {
    return false;
  }

  return true;
}

export { hasE2xgraderCellTypeChanged };
