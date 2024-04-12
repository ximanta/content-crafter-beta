import React, { useState } from 'react';
import axios from 'axios';
import './Blog.css';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Spinner from '../Spinner';
import { useNavigate } from 'react-router-dom';
import MarkdownPreview from '@uiw/react-markdown-preview';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Button, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChipInput from 'material-ui-chip-input';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';

const LevelOptions = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advance', label: 'Advance' },
];

const App = () => {
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState('500');
  const [audienceLevel, setAudienceLevel] = useState('Beginner');
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [isClick, setIsClick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [isCopyIconChanged, setIsCopyIconChanged] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please add a blog post title.');
      return;
    }
    if (title.length > 75) {
      setError('Title should not exceed 75 characters.');
      return;
    }
    const count = parseInt(wordCount);
    if (isNaN(count) || count < 0) {
      setError('Please enter a valid non-negative number for word count.');
      return;
    }
    if (count > 750) {
      setError('Word count should not exceed 750.');
      return;
    }

    const formData = new FormData();
    formData.append('input_text', title);
    formData.append('no_words', wordCount);
    formData.append('blog_style', audienceLevel);
    formData.append('keywords', keywords.join(','));
    setIsLoading(true);
    setIsClick(true);

    try {
      const response = await axios.post('https://contentcrafter-python-blog-1.onrender.com/blog', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResponse(response.data);
      setError('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Invalid request. Please check your input.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setTitle('');
    setWordCount('500');
    setAudienceLevel('Beginner');
    setKeywords([]);
    setError('');
    setResponse('');
    setIsClick(false);
    setIsLoading(false);
    setIsCopyIconChanged(false);
  };

  const handleAddChip = (chip) => {
    const newChips = chip.split(',').map(part => part.trim()).filter(part => part !== '');
    const remainingSpace = 5 - keywords.length;
    if (newChips.length > remainingSpace) {
      setError('You can only add up to 5 keywords.');
      return;
    }
    const chipsToAdd = newChips.slice(0, remainingSpace);
    setKeywords([...keywords, ...chipsToAdd]);
  };

  const handleDeleteChip = (chip, index) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setIsCopyIconChanged(true);
  };

  const generateDocxFile = async (text) => {
    // Generate a docx file based on the provided text
    // This is just a placeholder function, you should replace it with your actual implementation
    return new Blob([text], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const docxFile = await generateDocxFile(response);
      const blobUrl = URL.createObjectURL(docxFile);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "blog.md";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // User feedback: Download successful message
      console.log('Download successful!'); // Or display a success message to the user

    } catch (error) {
      setError('An error occurred while generating the DOCX file. Please try again later.');
      console.error('Error during download:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    '& .MuiTooltip-tooltip': {
      top: '-2vh',
      fontSize: '13px',
      backgroundColor: '#007bff',
    },
  }));

  return (
    <div className="blog-container">
      <div className="header1">
        <div className='title-container'>
          <button className="back-button" onClick={() => navigate('/')} style={{ color: "white" }}>
            <ArrowBackIosNewIcon />
          </button>
          <h1>BlogCrafter</h1>
        </div>
      </div>
      <div className='blog-card-containers'>
        <div className='blog-card'>
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <label>
                <div style={{ color: 'black' }}>Create a blog post titled</div>
                <Tooltip title="Enter the title of your blog" arrow >
                  <TextField
                    id="standard-basic"
                    variant="standard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  /><a style={{ color: 'black' }}>, </a>
                </Tooltip>
                <div style={{ color: 'black', marginTop: "15px" }}>with these</div>
                <ChipInput
                  value={keywords}
                  onAdd={(chip) => handleAddChip(chip)}
                  onDelete={(chip, index) => handleDeleteChip(chip, index)}
                  style={{ width: "65vh", marginLeft: "10px" }}
                  chipProps={{ style: { backgroundColor: 'blue', color: 'blue' } }}
                  newChipKeys={[',']} // Adding comma as a new chip key
                /> <div style={{ color: 'black', marginTop: "15px" }}>  keywords. </div>
                <div style={{ color: 'black', marginTop: "15px" }}>  It should be around </div>
                <Tooltip title="Enter the word count for your blog (up to 750)" arrow>
                  <TextField
                    id="outlined-number"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    value={wordCount}
                    inputProps={{ min: 50, max: 750 }}
                    onChange={(e) => setWordCount(e.target.value)}
                    variant="standard"
                  />
                </Tooltip>
                <div style={{ color: 'black', marginTop: "15px" }}>words and for</div>
                <TextField
                  id="standard-select-level"
                  select
                  value={audienceLevel}
                  onChange={(e) => setAudienceLevel(e.target.value)}
                  variant="standard"
                  style={{ marginLeft: "10px" }}
                >
                  {LevelOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <div style={{ color: 'black', marginTop: "15px" }}> level audience.</div>
              </label>
            </form>
          </div>
          <div className='btt-err-container'>
            <div className='error-cont'>
              {error && <p className="error" style={{}}>{error}</p>}
            </div>
          </div>
        </div>
        <div className="blog-response" style={{ maxWidth: '100%' }}>
          <div className='iicons'>
            {response && (<Tooltip title="Click to download in .md format" arrow><Button
              // variant="contained"
              color="primary"
              disabled={isDownloading}
              onClick={handleDownload}
            >
              <DownloadIcon />
            </Button>
            </Tooltip>
            )}
            {response && (
              <Tooltip title="Click to copy text" arrow>
                <Button
                  className="copy-button"
                  onClick={handleCopyToClipboard}
                  style={{ height: '30px' }}
                >
                  {isCopyIconChanged ? <CheckCircleIcon /> : <FileCopyIcon />}
                </Button>
              </Tooltip>
            )}
          </div>
          {isClick && isLoading && (
            <div className="spinner-container" >
              <Spinner />
            </div>
          )}
          {isClick && !isLoading && (
            <MarkdownPreview className="response-content" source={response} style={{ marginTop: "-8px" }} />
          )}
          {!isClick && <div className="welcome">Welcome to BlogCrafter, your virtual assistant in crafting compelling blog content to enhance your online visibility.</div>}
        </div>
      </div>
      <div className="buttons-container">
        <Tooltip title="Click to reset" arrow>
          <Button
            className="refresh-button"
            variant="contained"
            onClick={handleRefresh}
            style={{ backgroundColor: 'red', height: '40px', marginTop: '1%', marginRight: '2vh' }}
          >
            <RefreshIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Click to generate text" arrow>
          <Button
            className="generate-button"
            variant="contained"
            onClick={handleSubmit}
            disabled={!!response}
            style={{ height: '40px', marginTop: '1%' }}
          >
            Generate
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

export default App;
