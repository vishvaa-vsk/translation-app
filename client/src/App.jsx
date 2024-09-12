import axios from 'axios';
import { useState, useEffect } from 'react';
import { Box, 
  Flex, 
  Icon, 
  Grid, 
  GridItem, 
  Textarea, 
  Tabs, 
  TabList, 
  TabPanels,
  Tab, 
  TabPanel, 
  Stack, 
  FormLabel, 
  Heading, 
  Input, 
  Button } from '@chakra-ui/react';
import Select from 'react-select';
import LANGUAGES from './languages';
import { HiTranslate } from 'react-icons/hi';

const languageOptions = Object.keys(LANGUAGES).map(key => ({
  value: key,
  label: LANGUAGES[key].charAt(0).toUpperCase() + LANGUAGES[key].slice(1)
}));

export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:80/api" : "/api";

function App() {
  const [file, setFile] = useState(null);
  const [sourceLang, setSourceLang] = useState('auto');
  const [destLang, setDestLang] = useState('en'); 
  const [translatedText, setTranslatedText] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [sourceText, setSourceText] = useState('');

  useEffect(() => {
    if (sourceText === '') {
      setTranslatedText(''); 
    } else {
      handleTextTranslate();
    }
  }, [sourceText, sourceLang, destLang]); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSourceLangChange = (selectedOption) => {
    setSourceLang(selectedOption ? selectedOption.value : 'auto'); 
  };

  const handleDestLangChange = (selectedOption) => {
    setDestLang(selectedOption ? selectedOption.value : 'en');
  };

  const handleTextChange = (e) => {
    setSourceText(e.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dest-lang', destLang);

    try {
      const response = await axios.post(BASE_URL+'translate-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranslatedText(response.data.translated_text);
      setDownloadLink(`${BASE}/download/${response.data.translated_file}`);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleTextTranslate = async () => {
    try {
      const response = await axios.post(BASE_URL+'/translate-text', {
        "target-text": sourceText,
        "source-lang": sourceLang,
        "dest-lang": destLang,
      });
      setTranslatedText(response.data.translated_text);
      setSourceLang(response.data.source_lang);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  return (
    <Box>
      <Flex as="nav" align="center" justify="space-between" p={4} bg="blue.500" color="white">
        <Flex align="center">
          <Icon as={HiTranslate} boxSize={6} mr={2} />
          <Heading size="md">VerboTranslate</Heading>
        </Flex>
      </Flex>
      <Box p={5}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Translate Text</Tab>
          <Tab>Translate File</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Box mb={4}>
                  <Select
                    options={languageOptions}
                    value={languageOptions.find(option => option.value === sourceLang)}
                    onChange={handleSourceLangChange}
                    placeholder="Select source language"
                    isSearchable={true}
                    defaultValue={languageOptions.find(option => option.value === 'auto')}
                  />
                </Box>
                <Textarea
                  value={sourceText}
                  onChange={handleTextChange}
                  placeholder="Enter text here..."
                  size="md"
                  mb={4}
                  height="200px"
                />
              </GridItem>
              <GridItem>
                <Box mb={4}>
                  <Select
                    options={languageOptions}
                    value={languageOptions.find(option => option.value === destLang)}
                    onChange={handleDestLangChange}
                    placeholder="Select target language"
                    isSearchable={true}
                    defaultValue={languageOptions.find(option => option.value === 'en')}
                  />
                </Box>
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder="Translated text will appear here..."
                  size="md"
                  mb={4}
                  height="200px"
                />
              </GridItem>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Stack spacing={4}>
              <FormLabel htmlFor="file-upload">Upload File</FormLabel>
              <Input 
                id="file-upload" 
                type="file" 
                onChange={handleFileChange} 
                mb={4}
              />
              <Select
                options={languageOptions}
                value={languageOptions.find(option => option.value === destLang)}
                onChange={handleDestLangChange}
                placeholder="Select target language"
                isSearchable={true}
                defaultValue={languageOptions.find(option => option.value === 'en')}
              />
              <Button colorScheme="blue" onClick={handleUpload}>Translate File</Button>
              {downloadLink && (
                <Button
                  mt={4}
                  as="a"
                  href={downloadLink}
                  download
                  colorScheme="teal"
                >
                  Download Translated File
                </Button>
              )}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
    </Box>
    
  );
}

export default App;