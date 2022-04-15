import {
    Box,
    Card,
    CircularProgress,
    Container,
    Divider,
    Grid, Stack,
    Tab,
    Tabs,
    Typography, useMediaQuery
} from '@mui/material'
import React, {useEffect, useRef, useState} from 'react';
import CatalogGrid, {AddSelectionButton} from '../../components/catalogGrid';
import { grey } from '@mui/material/colors';
import ScheduleCalendar from '../../components/scheduleCalendar';
import ScheduleTable, {RemoveSelectionButton} from '../../components/scheduleTable';
import {useRouter} from "next/router";
import {usePreEnrollment} from "../../utility/hooks/usePreEnrollments";
import RecommendedGrid from '../../components/recommendedGrid';
import {useTheme} from "@mui/material/styles";

export default function Preenrollment() {
    const [value, setValue] = React.useState(0);
    const router = useRouter()
    const [preEnrollmentId, setPreEnrollmentId] = React.useState<number | null>(null);
    const {preEnrollment, isLoading, isError} = usePreEnrollment(preEnrollmentId) 
    // To keep track of selected cells without re-rendering
    const selectedAddCoursesRef = useRef([])
    const removeSelectionRef = useRef([])
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('sm'), {noSsr:true});
    
    
    useEffect(() => {
        let pId = parseInt(router.query.preEnrollmentId as string)
        if (isNaN(pId)) 
            return
        setPreEnrollmentId(pId)
    }, [router.query])

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    interface TabPanelProps {
        children?: React.ReactNode;
        index: number;
        value: number;
    }
    
    function TabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;

        return (
            <Box
                {...other}
            >
                {value === index && (
                    <Box sx={classes.tabContent}>
                        {children}
                    </Box>
                )}
            </Box>
        );
    }
    
    if(isError) {
        router.push("/home")
        return <></>
    }
    
    if (isLoading || !preEnrollmentId ) {
        return <Grid alignItems="center" justifyContent="center" alignContent="center">
            <CircularProgress />
        </Grid>
    }
    
    function ContainerComp({children}:any) {
        if (matches) {
            return <Container sx={classes.mainGrid}>{children}</Container>
        } 
        return <Stack sx={classes.mainGrid}>{children}</Stack>
    }
    
    return (
        <ContainerComp>
            
            <Card sx={classes.topCard}>
                <Grid container direction="row" justifyContent="space-between" alignItems="center">
                    
                    <Grid item>
                        <Grid container direction="row" alignItems="center">
                            <Typography sx={classes.title}>Pre-Enrollments</Typography>
                            <Divider orientation="vertical" variant='middle' light flexItem sx={classes.dividerItem}/>
                            <Typography sx={classes.title2}>{preEnrollment?.name}: {preEnrollment?.semester.term} - {preEnrollment?.semester.year}</Typography>
                        </Grid>
                    </Grid>

                </Grid>
            </Card>
            
            <Card sx={classes.contentCard}>
                <Grid container direction="row" justifyContent={"space-between"}>

                    <Grid item>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            textColor="secondary"
                            indicatorColor="secondary"
                        >
                            <Tab label='Schedule' />
                            <Tab label='Courses'/>
                            <Tab label='Recommended'/>
                        </Tabs>
                    </Grid>

                    {(value === 0)?(
                        <Grid item>
                            <RemoveSelectionButton
                                preEnrollmentId={preEnrollmentId}
                                selectionsRef={removeSelectionRef}
                            />
                        </Grid>
                    ):
                        <Grid item>
                            <AddSelectionButton 
                                changeTab = {()=>{setValue(0)}}
                                selectionsRef={selectedAddCoursesRef} 
                                preEnrollmentId={preEnrollmentId}
                            />
                        </Grid>
                    }

                </Grid>
                <TabPanel value={value} index={0}>
                    <ScheduleTable selections={preEnrollment!.selections} selectionRef={removeSelectionRef} />
                    <ScheduleCalendar courseOfferings={preEnrollment!.selections}/>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <CatalogGrid selectionsRef={selectedAddCoursesRef} exclude={preEnrollment!.selections.map(sel => sel.id)} semesterId={preEnrollment!.semester.id}/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <RecommendedGrid selectionsRef={selectedAddCoursesRef} exclude={preEnrollment!.selections.map(sel => sel.id)} semesterId={preEnrollment!.semester.id}/>
                </TabPanel>
            </Card>
        
        
        </ContainerComp>
    )
}

const useStyles = {
    mainGrid: {
        padding: 0
    },
    topCard: {
        padding: '5px 25px',
        backgroundColor: 'primary.light',
        marginBottom: 1.5
    },
    title: {
        padding: '8px 0',
    },
    title2: {
        padding: '8px 0',
        // fontWeight: 'bold',
    },
    dividerItem: {
        marginLeft: 2,
        marginRight: 2,
    },
    searchInput: {
        backgroundColor: 'white'
    },
    semesterSelect: {
        backgroundColor: 'white',
        minWidth: '300px'
    },
    contentCard: {
        backgroundColor: grey[200],
        padding: '25px',
        minHeight: '80vh',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        marginTop: 2,
    },
};

const classes = useStyles;