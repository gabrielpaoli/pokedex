import TextField from "@mui/material/TextField";
import { useLanguage } from '../i18n/Language';


const FormInput = (props) => {
    const { t } = useLanguage();
    return (
		<TextField
		id="outlined-basic"
		onChange={props.inputHandler}
		variant="outlined"
		fullWidth
		label={t('search')}
		placeholder={t('searchPlaceholder')}
	/>
	  );

};
	
export default FormInput;