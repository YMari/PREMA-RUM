import {
    Autocomplete,
    Box,
    Card,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    styled,
    TextField,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
    useMediaQuery
} from '@mui/material'
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { grey } from '@mui/material/colors';
import { DataGrid, GridColumns, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import getAllSemesters from '../../utility/requests/getAllSemesters';
import { ISemesterResponse } from '../../utility/requests/responseTypes';
import { useSemesterOfferings } from '../../utility/hooks/useSemesterOfferings';
import { GetRows } from '../../utility/helpers/selectionToRow';
import { GetColumnFormat } from '../../utility/helpers/ColumnFormat';
import QuickSearchToolbar, {
    QuickSearchToolbarProps,
    requestSearch
} from "../../components/DataGridAddOns/QuickSearchToolbar";
import {useTheme} from "@mui/material/styles";

type SemesterProps = {
    semesters: ISemesterResponse[]
}

type CatalogGridProps = {
    semesterId: number,
    exclude: number[],
    selectionsRef: any// Ids to exclude
}

function CustomToolbar() {
    return(
        <Box sx={classes.toolbarBox}>
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
            </GridToolbarContainer>
        </Box>
    )
}

function WrapToolBars(props: QuickSearchToolbarProps) {
    const theme = useTheme()
    const match = useMediaQuery(theme.breakpoints.down("sm"))

    return <>
        <QuickSearchToolbar {...props} />
        {!match? <CustomToolbar /> : null}
    </>
}

export default function Catalog({semesters}: SemesterProps) {
    const [semesterID, setSemesterID] = useState(0)
    const {courseOfferings, isLoading, isError} = useSemesterOfferings(semesterID);
    const [rows, setRows] = useState([])
    const [quickSearchState, setQuickSearchState] = useState("")
    
    const handleSemesterID = (id: number) => {
        setSemesterID(id);
    };

    useEffect(() => {
        if (!isLoading)  {
            console.log(courseOfferings)
            GetRows(courseOfferings).then(res => {setRows(res as any)})
        }
    }, [courseOfferings])

    if (!rows || isLoading) {
        return(
            <Grid container direction="column" justifyContent="center" alignContent="center">
                <CircularProgress />
            </Grid>
        )
    }

    return (
        <>
        <Grid container direction="column">

            <Grid item>
                <Card sx={classes.topCard}>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        
                        <Grid item>
                            <Grid container direction="row" alignItems="center">
                                <Typography sx={classes.title}>Course Catalog</Typography>
                                <Divider orientation="vertical" variant='middle' light flexItem sx={classes.dividerItem}/>
                                {/* <TextField size="small" variant="outlined" placeholder="Search Courses..." sx={classes.searchInput}/> */}
                                <Autocomplete
                                    sx={classes.semesterSelect}
                                    id="semester-select"
                                    options={semesters}
                                    getOptionLabel={(option) => `${option.term} - ${option.year}`}
                                    filterSelectedOptions
                                    size="small"
                                    onChange={(event: any, newValue: ISemesterResponse | null) => {handleSemesterID(newValue? newValue.id : 0)}}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Semester Selection"
                                            placeholder="Select Semester..."
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                    </Grid>
                </Card>
            </Grid>
            

            <Grid item>
                <Card sx={classes.contentCard} >
                    <Paper elevation={0} sx={classes.dataContainer}>
                        <DataGrid
                            autoHeight
                            disableSelectionOnClick
                            pageSize={25}
                            rowHeight={75}
                            rows={rows}
                            columns={GetColumnFormat({creditSum: null})}
                            components={{
                                Toolbar: WrapToolBars,
                            }}
                            componentsProps={{
                                toolbar: {
                                    value: quickSearchState,
                                    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                                        requestSearch({
                                            searchValue: event.target.value,
                                            setSearchText: setQuickSearchState,
                                            rowSetter: (rec: any[]) => GetRows(rec).then(res => setRows(res as any)),
                                            rows: courseOfferings!
                                        }),
                                    clearSearch: () => {
                                        setQuickSearchState("")
                                        GetRows(courseOfferings!)
                                            .then(res => setRows(res as any))
                                    }
                                }
                            }}
                        />
                    </Paper>
                </Card>
            </Grid>
          
        </Grid>
        </>
    )
}

const useStyles = {
    toolbarBox: {
        marginTop: 1,
        marginLeft: 1,
    },
    topCard: {
        padding: '5px 25px',
        backgroundColor: 'primary.light',
        marginBottom: 1.5
    },
    title: {
        padding: '8px 0',
    },
    dividerItem: {
        marginLeft: 2,
        marginRight: 2,
    },
    semesterSelect: {
        backgroundColor: 'white',
        minWidth: '300px'
    },
    addCoursesButton: {
        backgroundColor: 'primary.dark'
    },
    contentCard: {
        backgroundColor: grey[100],
        padding: '15px',
        minHeight: '80vh',
        overflow: 'auto',
    },
    dataContainer: {

    },
  };

const classes = useStyles;

export async function getStaticProps() {
    return {
        props: {
            semesters: await getAllSemesters()
        }, // will be passed to the page component as props
        revalidate: 3600*2 // revalidate every hour
    }
}