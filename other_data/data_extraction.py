import csv
import pandas as pd

STATE = 0
AE = 1
OUTLET = 2
PLS_folder = 'PLS/'

file_info = {
	2020: ['PLS_FY20_State_pud20i', 'PLS_FY20_AE_pud20i', 'PLS_FY20_Outlet_pud20i'],
	2019: ['pls_state_pud19i', 'PLS_FY19_AE_pud19i', 'PLS_FY19_Outlet_pud19i' ],
	2018: ['pls_fy18_state_pud18i', 'pls_fy18_ae_pud18i', 'pls_fy18_outlet_pud18i'],
	2017: ['PLS_FY17_State_pud17i', 'PLS_FY17_AE_pud17i', 'PLS_FY17_Outlet_pud17i'],
	2016: ['PLS_FY2016_State_pusum16a', 'PLS_FY2016_AE_pupld16a_updated', 'PLS_FY2016_Outlet_puout16a'],
	2015: ['PLS_FY2015_State_pusum15a', 'PLS_FY2015_AE_pupld15a', 'PLS_FY2015_Outlet_puout15a'],
	2014: ['PLS_FY2014_State_pusum14a', 'PLS_FY2014_AE_pupld14a', 'PLS_FY2014_Outlet_puout14a'],
	2013: ['Pusum13a', 'Pupld13a', 'Puout13a'],
	2012: ['Pusum12a', 'Pupld12a', 'Puout12a'],
	2011: ['pusum11b', 'pupld11b', 'puout11b'],
	2010: ['pusum10a', 'pupld10a', 'puout10a'],
	2009: ['pusum09a', 'pupld09a', 'puout09a'],
	2008: ['pusum08a', 'pupld08a', 'puout08a'],
	2007: ['pusum07', 'pupld07', 'puout07'],
	2006: ['pusum06a', 'pupld06a', 'puout06a'],
	2005: ['pusum05a', 'pupld05a', 'puout05a'],
	2004: ['pusum04a', 'pupld04a', 'puout04a'],
	2003: ['pusum03a', 'pupld03a', 'puout03a'],
	2002: ['pusum02a', 'pupld02b', 'puout02a'],
	2001: ['pusum01', 'pupld01b', 'puout01'],
	2000: ['pusum00', 'pupldf00', 'PUOUT00'],
	1999: ['pusum99', 'pupldf99', 'PUOUT99'],
	1998: ['PUSUM98', 'PUPLDF98', 'PUOUT98'],
	1997: ['PUSUM97', 'PUPLDF97', 'PUOUT97'],
	1996: ['PUSUM96', 'PUPLDF96', 'PUOUT96'],
	1995: ['PUSUM95', 'PUPLDF95', 'PUOUT95'],
	1994: ['PUSUM94', 'PUPLDF94', 'PUOUT94'],
	1993: ['PUSUM93', 'PUPLDF93', 'PUOUT93'],
	1992: ['PUSUM92', 'PUPLDF92', 'PUOUT92']
}

pls_state_data = {}
pls_ae_data = {}
pls_outlet_data = {}
for i in range(1992, 2021):
	pls_state_data[i] = pd.read_csv(PLS_folder + str(i) + '/' + file_info[i][STATE] + ".csv", encoding='cp1252')
	pls_ae_data[i] = pd.read_csv(PLS_folder + str(i) + '/' + file_info[i][AE] + ".csv", encoding='cp1252')
	pls_outlet_data[i] = pd.read_csv(PLS_folder + str(i) + '/' + file_info[i][OUTLET] + ".csv", encoding='cp1252')

