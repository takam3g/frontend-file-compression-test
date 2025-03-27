import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ImageCompressionPage from './pages/ImageCompressionPage';
import FileCompressionPage from './pages/FileCompressionPage';
import VideoCompressionPage from './pages/VideoCompressionPage';

function App() {
  return (
    <Router>
      <div style={{ width: '100%', padding: '10%' }}>
        <h1>FEでのファイル圧縮</h1>
        <nav>
          <ul style={{ textAlign: 'left', paddingLeft: 0, listStyle: 'none' }}>
            <li>
              <Link to="/image">画像圧縮</Link>
            </li>
            <li>
              <Link to="/file">ファイル圧縮</Link>
            </li>
            <li>
              <Link to="/video">動画圧縮</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/image" element={<ImageCompressionPage />} />
          <Route path="/file" element={<FileCompressionPage />} />
          <Route path="/video" element={<VideoCompressionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
