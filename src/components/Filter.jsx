import { Card, CardContent, Typography, TextField, MenuItem, Select, Button } from '@mui/material';

const Filter = () => {
  return (
    <Card sx={{ maxWidth: 400, width: '100%', mx: 'auto', p: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Фильтры
        </Typography>
        <Typography variant="body1" mb={1}>Возраст</Typography>
        <TextField
          label="Мин. возраст"
          type="number"
          name="ageMin"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Макс. возраст"
          type="number"
          name="ageMax"
          fullWidth
          margin="normal"
        />
        <Typography variant="body1" mt={2} mb={1}>Пол</Typography>
        <Select name="gender" fullWidth defaultValue="all">
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="male">Мужской</MenuItem>
          <MenuItem value="female">Женский</MenuItem>
        </Select>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
};

export default Filter;
