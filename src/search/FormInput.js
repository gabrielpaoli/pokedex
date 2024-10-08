import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import TextField from "@mui/material/TextField";


const FormInput = (props) => {

    return (
		<TextField
		id="outlined-basic"
		onChange={props.inputHandler}
		variant="outlined"
		fullWidth
		label="Search"
		placeholder="Enter at least 3 characters"
	/>
	  );

};
	
export default FormInput;