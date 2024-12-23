import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------



export default function Loading({text = "Chargement..."}: {text?: string}) {
  return (
    <>
      <Container>
        <Box
          sx={{
            py: 2,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            {text}
          </Typography>
        </Box>
      </Container>
    </>
  );
}
