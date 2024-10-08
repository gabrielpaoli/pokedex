import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const FormInput = (props) => {

    return (
		<FormControl fullWidth>
			<InputLabel id={props.id}>{props.label}</InputLabel>
			<Select
				labelId={props.id}
				id={props.id}
				value={props.value}
				label={props.label}
				onChange={props.handle}
			>
				{props.menuItemIterator.map((menuItem, i) => (
					<MenuItem key={menuItem.name} value={menuItem.name}>{menuItem.parsedName}</MenuItem>
				))}
			</Select>
		</FormControl>
	  );

};
	
export default FormInput;