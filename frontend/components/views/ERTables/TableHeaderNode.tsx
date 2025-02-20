import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { Save } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import {
  AlterTablesObjType,
  AddColumnsObjType,
  DropTablesObjType,
  TableHeaderDataObjectType,
  AlterColumnsObjType,
} from '../../../types';
import './styles.css';
import * as colors from '../../../style-variables';
import { sendFeedback } from '../../../lib/utils';

type TableHeaderProps = {
  data: TableHeaderDataObjectType;
};

function TableHeader({ data }: TableHeaderProps) {
  const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;
  // find table we are editing in schemaStateCopy to use throughout all of our TableHeader functions
  const currentTable = schemaStateCopy.tableList.find(
    (table) => table.table_name === table_name,
  );

  // This function handles the add delete button on the table
  const handleDeleteTable = (): void => {
    // create a dropTables Obj
    const dropTablesObj: DropTablesObjType = {
      table_name,
      table_schema: currentTable.table_schema,
    };
    // update backendObj
    backendObj.current.updates.dropTables.push(dropTablesObj);
    // update frontend
    schemaStateCopy.tableList = schemaStateCopy.tableList.filter(
      (table) => table.table_name !== table_name,
    );
    // set the state with the modified copy
    setSchemaState(schemaStateCopy);
  };
  // Added a warning on click. It seems like changing table names is not a great idea. I don't think the app correctly renames constraints, so support of this feature should be limited for now.
  const warnUser = (): void => {
    sendFeedback({
      type: 'error',
      message:
        'WARNING: Table name saved, but changing table name will only rename constraints in fk_tableNameColumnName format. Use at your own discretion.',
    });
  };

  const handleChangeTableName = (): void => {
    const tableInputField = document.getElementById(
      `table-name-form-${data.table_name}`,
    ) as HTMLInputElement;

    // update backend
    const alterColumnsArray: AlterColumnsObjType[] = [];
    for (let j = 0; j < currentTable.columns.length; j += 1) {
      const alterColumnsObj: AlterColumnsObjType = {
        column_name: currentTable.columns[j].column_name,
        character_maximum_length: null,
        new_column_name: null,
        add_constraint: [],
        current_data_type: null,
        data_type: null,
        is_nullable: null,
        drop_constraint: [],
        rename_constraint: null,
        table_schema: null,
        table_name: null,
        constraint_type: null,
      };
      if (currentTable.columns[j].constraint_type === 'PRIMARY KEY') {
        alterColumnsObj.rename_constraint = `pk_${currentTable.table_name}${currentTable.columns[j].column_name}`;
        alterColumnsArray.push(alterColumnsObj);
      }
      if (currentTable.columns[j].constraint_type === 'FOREIGN KEY') {
        alterColumnsObj.rename_constraint = `fk_${currentTable.table_name}${currentTable.columns[j].column_name}`;
        alterColumnsArray.push(alterColumnsObj);
      }
      if (currentTable.columns[j].constraint_type === 'UNIQUE') {
        alterColumnsObj.rename_constraint = `unique_${currentTable.table_name}${currentTable.columns[j].column_name}`;
        alterColumnsArray.push(alterColumnsObj);
      }
    }
    const alterTablesObj: AlterTablesObjType = {
      is_insertable_into: currentTable.is_insertable_into,
      table_catalog: currentTable.table_catalog,
      table_name: currentTable.table_name,
      new_table_name: tableInputField.value,
      table_schema: currentTable.table_schema,
      addColumns: [],
      dropColumns: [],
      alterColumns: alterColumnsArray,
    };

    // update frontend
    if (tableInputField !== null) {
      currentTable.new_table_name = tableInputField.value;
      setSchemaState(schemaStateCopy);
      console.log(schemaStateCopy);
    }
    console.log(alterTablesObj);
    backendObj.current.updates.alterTables.push(alterTablesObj);
  };

  return (
    <div
      style={{ backgroundColor: colors.greyLightest }}
      className="table-header table"
    >
      <TextField
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Save Table Name">
                <Save
                  style={{ cursor: 'pointer' }}
                  onClick={handleChangeTableName}
                />
              </Tooltip>
            </InputAdornment>
          ),
        }}
        id={`table-name-form-${data.table_name}`}
        label="Table Name"
        variant="outlined"
        defaultValue={data.table_name}
        // onKeyDown={handleChangeTableName}
        onClick={warnUser}
        style={{ backgroundColor: 'white' }}
      />
      <Tooltip title="Delete Table">
        <IconButton onClick={handleDeleteTable} size="large">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default TableHeader;
