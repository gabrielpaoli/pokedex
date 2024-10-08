import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';


const FormTypes = (props) => {

    return (
			<Grid container spacing={2}>
				{props.searchTypes.map((type, i) => (
					<Grid item xs={4} lg={1} key={type+"-"+i}>
						<Button className={`background-color-${type.name}`} fullWidth
							sx={{ 
								color: 'white', 
								className: 'background-color-' + type.name,
								border: type.checked ? '2px dashed black' : '2px solid transparent'
							}}
								onClick={ () => props.clickType(type, i) }
						>
							{type.name}
						</Button>
					</Grid>
				))
				}

			</Grid>
	  );

};
	
export default FormTypes;