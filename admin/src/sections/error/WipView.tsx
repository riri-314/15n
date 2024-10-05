import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RouterLink from '../../routes/RouterLink';



// ----------------------------------------------------------------------

export default function WipView() {

    return (<>
            <Container>
                <Box
                    sx={{
                        py: 12,
                        maxWidth: 480,
                        mx: 'auto',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h3" sx={{mb: 3}}>
                        Work in progress 👷
                    </Typography>
                    <Typography sx={{color: 'text.secondary', mb: 3}} >
                        Nous travaillons encore sur cette section. Elle sera bientôt disponible.

                    </Typography>

                    <Button href="/" size="large" variant="contained" component={RouterLink}>
                        Retourner au scanner
                    </Button>
                </Box>
            </Container>
        </>);
}

